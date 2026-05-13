import { supabase } from '@/shared/lib/supabase';
import { compressImage, fileToBase64 } from '@/shared/lib/image-compression';
import { useQueueStore } from '@/shared/lib/store';
import { Job } from '@/shared/api/schema';

/**
 * The Client-Side Job Orchestrator
 * Handles the robust flow of compression, database tracking, and API calls.
 * Ensures long-running tasks don't silently fail if the serverless function dies.
 */
export class JobOrchestrator {
  
  static async startInventoryScan(files: File[], branchId: string, model: string): Promise<string> {
    const store = useQueueStore.getState();
    
    // 1. Create a pending job in the local store & database
    const newJob: Job = {
      id: crypto.randomUUID(),
      status: 'pending',
      type: 'inventory_scan',
      payload: { fileCount: files.length, model },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.addJob(newJob);

    try {
      // Sync to Supabase to track across devices
      await supabase.from('jobs').insert(newJob);

      // 2. Compress images client-side
      store.updateJob(newJob.id, { status: 'processing' });
      await supabase.from('jobs').update({ status: 'processing' }).eq('id', newJob.id);

      const compressedFiles = await Promise.all(files.map(compressImage));
      
      // Convert to base64 for the API payload (temporary until we do direct-to-storage)
      const base64Images = await Promise.all(
        compressedFiles.map(async (file) => ({
          data: await fileToBase64(file),
          mimeType: file.type,
          name: file.name
        }))
      );

      // 3. Call the Next.js API route to trigger Gemini & Storage
      // By compressing first, we drastically reduce the payload size and time.
      const response = await fetch('/api/inventory/scan-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: newJob.id,
          images: base64Images,
          branchId,
          model
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();

      // 4. Update Job as Completed
      store.updateJob(newJob.id, { status: 'completed', result });
      
      // The API route should handle the DB update, but we do it client-side as fallback
      await supabase.from('jobs').update({ 
        status: 'completed', 
        result 
      }).eq('id', newJob.id);

      return newJob.id;

    } catch (error: any) {
      console.error('Job Orchestration Failed:', error);
      
      // Update local and remote state to failed
      store.updateJob(newJob.id, { status: 'failed', error: error.message });
      await supabase.from('jobs').update({ 
        status: 'failed', 
        error: error.message 
      }).eq('id', newJob.id);
      
      throw error;
    }
  }
}
