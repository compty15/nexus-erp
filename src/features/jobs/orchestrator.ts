import { supabase } from '@/shared/lib/supabase';
import { compressImage, fileToBase64 } from '@/shared/lib/image-compression';
import { useQueueStore } from '@/shared/lib/store';
import { Job } from '@/shared/api/schema';

/**
 * The Client-Side Job Orchestrator
 * Handles the robust flow of compression, database tracking, and API calls.
 * Ensures long-running tasks don't silently fail if the serverless function dies.
 */
/**
 * Helper to wrap fetch with a timeout
 */
async function fetchWithTimeout(resource: string, options: any = {}) {
  const { timeout = 120000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Intelligence Engine timed out. Please try a faster model or check your connection.');
    }
    throw error;
  }
}

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

      // 2. Upload directly to Supabase Storage (bypassing Vercel limits)
      store.updateJob(newJob.id, { status: 'processing' });
      await supabase.from('jobs').update({ status: 'processing' }).eq('id', newJob.id);

      const { uploadToStorage } = await import('@/shared/lib/upload');
      
      const uploadWithRetry = async (file: File, bucket: string, retries = 3): Promise<string> => {
        try {
          return await uploadToStorage(file, bucket);
        } catch (err) {
          if (retries > 0) {
            console.log(`Retrying upload for ${file.name}... (${retries} left)`);
            await new Promise(r => setTimeout(r, 1000));
            return uploadWithRetry(file, bucket, retries - 1);
          }
          throw err;
        }
      };

      const storageUrls = await Promise.all(
        files.map(async (file) => {
          const isImage = file.type.startsWith('image/') || 
                          ['.heic', '.heif', '.dng'].some(ext => file.name.toLowerCase().endsWith(ext));

          if (isImage) {
            const processedFile = await compressImage(file);
            return await uploadWithRetry(processedFile, 'raw_images');
          }
          return await uploadWithRetry(file, 'raw_images');
        })
      );

      // Save URLs to payload so we can retry without re-uploading
      store.updateJob(newJob.id, { payload: { ...newJob.payload, imageUrls: storageUrls } });

      // 3. Call the Next.js API route with timeout
      const response = await fetchWithTimeout('/api/inventory/scan-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: newJob.id,
          imageUrls: storageUrls,
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
      
      await supabase.from('jobs').update({ 
        status: 'completed', 
        result 
      }).eq('id', newJob.id);

      return newJob.id;

    } catch (error: any) {
      console.error('Job Orchestration Failed:', error);
      store.updateJob(newJob.id, { status: 'failed', error: error.message });
      await supabase.from('jobs').update({ status: 'failed', error: error.message }).eq('id', newJob.id);
      throw error;
    }
  }

  /**
   * Retries an existing job with a potentially different model.
   */
  static async retryInventoryScan(jobId: string, model: string, branchId: string): Promise<void> {
    const store = useQueueStore.getState();
    const job = store.pendingJobs.find(j => j.id === jobId);
    if (!job) throw new Error('Job not found');

    if (job.type === 'text_extrapolation') {
      return this.retryTextExtrapolation(jobId, model, branchId);
    }

    if (!job.payload?.imageUrls) {
      throw new Error('Cannot retry: Missing image references.');
    }

    store.updateJob(jobId, { status: 'processing', error: null, payload: { ...job.payload, model } });
    await supabase.from('jobs').update({ status: 'processing', error: null, payload: { ...job.payload, model } }).eq('id', jobId);

    try {
      const response = await fetchWithTimeout('/api/inventory/scan-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          imageUrls: job.payload.imageUrls,
          branchId,
          model
        })
      });

      if (!response.ok) throw new Error(await response.text());

      const result = await response.json();
      store.updateJob(jobId, { status: 'completed', result });
      await supabase.from('jobs').update({ status: 'completed', result }).eq('id', jobId);

    } catch (error: any) {
      console.error('Retry Failed:', error);
      store.updateJob(jobId, { status: 'failed', error: error.message });
      await supabase.from('jobs').update({ status: 'failed', error: error.message }).eq('id', jobId);
    }
  }

  static async retryTextExtrapolation(jobId: string, model: string, branchId: string): Promise<void> {
    const store = useQueueStore.getState();
    const job = store.pendingJobs.find(j => j.id === jobId);
    if (!job || !job.payload?.description) throw new Error('Missing job description.');

    store.updateJob(jobId, { status: 'processing', error: null, payload: { ...job.payload, model } });
    await supabase.from('jobs').update({ status: 'processing', error: null, payload: { ...job.payload, model } }).eq('id', jobId);

    try {
      const response = await fetchWithTimeout('/api/inventory/extrapolate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          description: job.payload.description,
          branchId,
          model
        })
      });

      if (!response.ok) throw new Error(await response.text());

      const result = await response.json();
      store.updateJob(jobId, { status: 'completed', result });
      await supabase.from('jobs').update({ status: 'completed', result }).eq('id', jobId);

    } catch (error: any) {
      console.error('Text Retry Failed:', error);
      store.updateJob(jobId, { status: 'failed', error: error.message });
      await supabase.from('jobs').update({ status: 'failed', error: error.message }).eq('id', jobId);
    }
  }

  static async startTextExtrapolation(description: string, branchId: string, model: string): Promise<string> {
    const store = useQueueStore.getState();
    
    const newJob: Job = {
      id: crypto.randomUUID(),
      status: 'pending',
      type: 'text_extrapolation',
      payload: { description, model },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.addJob(newJob);

    try {
      await supabase.from('jobs').insert(newJob);

      store.updateJob(newJob.id, { status: 'processing' });
      await supabase.from('jobs').update({ status: 'processing' }).eq('id', newJob.id);

      const response = await fetchWithTimeout('/api/inventory/extrapolate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: newJob.id,
          description,
          branchId,
          model
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();

      store.updateJob(newJob.id, { status: 'completed', result });
      await supabase.from('jobs').update({ 
        status: 'completed', 
        result 
      }).eq('id', newJob.id);

      return newJob.id;

    } catch (error: any) {
      console.error('Text Extrapolation Failed:', error);
      store.updateJob(newJob.id, { status: 'failed', error: error.message });
      await supabase.from('jobs').update({ status: 'failed', error: error.message }).eq('id', newJob.id);
      throw error;
    }
  }
}
