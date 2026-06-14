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
  const { timeout = 120000, signal: externalSignal } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => {
      clearTimeout(id);
      controller.abort();
    }, { once: true });
  }
  
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
      if (externalSignal?.aborted) throw new Error('Operation cancelled by user.');
      throw new Error('Intelligence Engine timed out. Please try a faster model or check your connection.');
    }
    throw error;
  }
}

export class JobOrchestrator {
  static controllers = new Map<string, AbortController>();
  
  static async cancelJob(jobId: string): Promise<void> {
    const controller = this.controllers.get(jobId);
    if (controller) {
      controller.abort();
      this.controllers.delete(jobId);
    }

    const store = useQueueStore.getState();
    const job = store.pendingJobs.find(j => j.id === jobId);
    
    if (job) {
      // 1. Cleanup Storage
      if (job.payload?.imageUrls) {
        const { deleteFromStorage } = await import('@/shared/lib/upload');
        // Extract paths from public URLs
        const paths = job.payload.imageUrls.map((url: string) => {
          const parts = url.split('/raw_images/');
          return parts.length > 1 ? parts[1] : null;
        }).filter(Boolean);
        
        if (paths.length > 0) {
          await deleteFromStorage(paths);
        }
      }

      // 2. Cleanup Database Items
      if (job.payload?.createdItemIds?.length > 0) {
        await supabase.from('inventory').delete().in('id', job.payload.createdItemIds);
      }

      // 3. Delete Job
      await supabase.from('jobs').delete().eq('id', jobId);
      
      // 4. Update Store
      store.cancelJob(jobId);
    }
  }

  
  static async startInventoryScan(files: File[], branchId: string, modelType: string): Promise<string> {
    const store = useQueueStore.getState();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Create a pending job in the local store & database
    const newJob: Job = {
      id: crypto.randomUUID(),
      user_id: user?.id,
      status: 'pending',
      type: 'inventory_scan',
      payload: { fileCount: files.length, model: modelType },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.addJob(newJob);

    try {
      // Sync to Supabase to track across devices
      await supabase.from('jobs').insert(newJob);

      const controller = new AbortController();
      this.controllers.set(newJob.id, controller);

      // 2. Upload directly to Supabase Storage (bypassing Vercel limits)
      store.updateJob(newJob.id, { status: 'processing' });
      await supabase.from('jobs').update({ status: 'processing' }).eq('id', newJob.id);

      const { uploadToStorage } = await import('@/shared/lib/upload');
      
      const uploadWithRetry = async (file: File, bucket: string, retries = 3): Promise<{path: string, publicUrl: string}> => {
        try {
          if (controller.signal.aborted) throw new Error('Cancelled');
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

      const storageResults = await Promise.all(
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

      const storageUrls = storageResults.map(r => r.publicUrl);
      const storagePaths = storageResults.map(r => r.path);

      // Save URLs to payload so we can retry without re-uploading
      store.updateJob(newJob.id, { payload: { ...newJob.payload, imageUrls: storageUrls } });

      // 3. Clustering Stage (Stage B)
      store.updateJob(newJob.id, { status: 'processing', payload: { ...newJob.payload, imageUrls: storageUrls, stage: 'clustering' } });
      
      const clusterRes = await fetch('/api/inventory/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ imageUrls: storageUrls })
      });

      const clusterData = await clusterRes.json().catch(() => ({}));
      if (!clusterRes.ok) {
        throw new Error(clusterData.error || 'Clustering stage failed.');
      }
      const { clusters } = clusterData;

      // Sanity check: If we have many images but only 1 cluster, log it as suspicious
      if (storageUrls.length > 10 && clusters.length === 1) {
        console.warn(`Suspicious clustering: ${storageUrls.length} images grouped into 1 cluster.`);
        await supabase.from('activity_logs').insert({
          event_type: 'cluster_warning',
          severity: 'warning',
          message: `Suspiciously high concentration: ${storageUrls.length} images grouped into 1 item.`,
          metadata: { jobId: newJob.id, imageCount: storageUrls.length }
        });
      }

      // 4. Sequential Identification (Stage C)
      const results = [];
      for (const cluster of clusters) {
        const clusterUrls = cluster.indices.map((idx: number) => storageUrls[idx]);
        
        store.updateJob(newJob.id, { 
          payload: { 
            ...newJob.payload, 
            stage: `identifying_${cluster.item_name}`,
            currentCluster: cluster.item_name 
          } 
        });

        const scanRes = await fetchWithTimeout('/api/inventory/scan-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            jobId: newJob.id,
            imageUrls: clusterUrls,
            branchId,
            modelType
          })
        });

        if (scanRes.ok) {
          const scanData = await scanRes.json();
          results.push(scanData);
          // Track created item ID for potential cleanup
          if (scanData.itemId) {
            const currentItemIds = useQueueStore.getState().pendingJobs.find(j => j.id === newJob.id)?.payload?.createdItemIds || [];
            store.updateJob(newJob.id, { 
              payload: { 
                ...useQueueStore.getState().pendingJobs.find(j => j.id === newJob.id)?.payload, 
                createdItemIds: [...currentItemIds, scanData.itemId] 
              } 
            });
          }
        }
      }

      // 5. Finalize
      store.updateJob(newJob.id, { status: 'completed', result: { itemsDetected: results.length, details: results } });
      await supabase.from('jobs').update({ 
        status: 'completed', 
        result: { itemsDetected: results.length } 
      }).eq('id', newJob.id);

      this.controllers.delete(newJob.id);
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
  static async retryInventoryScan(jobId: string, modelType: string, branchId: string): Promise<void> {
    const store = useQueueStore.getState();
    const job = store.pendingJobs.find(j => j.id === jobId);
    if (!job) throw new Error('Job not found');

    if (job.type === 'text_extrapolation') {
      return this.retryTextExtrapolation(jobId, modelType, branchId);
    }

    if (!job.payload?.imageUrls) {
      throw new Error('Cannot retry: Missing image references.');
    }

    store.updateJob(jobId, { status: 'processing', error: null, payload: { ...job.payload, model: modelType } });
    await supabase.from('jobs').update({ status: 'processing', error: null, payload: { ...job.payload, model: modelType } }).eq('id', jobId);

    try {
      const response = await fetchWithTimeout('/api/inventory/scan-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          imageUrls: job.payload.imageUrls,
          branchId,
          modelType
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

  static async retryTextExtrapolation(jobId: string, modelType: string, branchId: string): Promise<void> {
    const store = useQueueStore.getState();
    const job = store.pendingJobs.find(j => j.id === jobId);
    if (!job || !job.payload?.description) throw new Error('Missing job description.');

    store.updateJob(jobId, { status: 'processing', error: null, payload: { ...job.payload, model: modelType } });
    await supabase.from('jobs').update({ status: 'processing', error: null, payload: { ...job.payload, model: modelType } }).eq('id', jobId);

    try {
      const response = await fetchWithTimeout('/api/inventory/extrapolate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          description: job.payload.description,
          branchId,
          modelType
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

  static async startTextExtrapolation(description: string, branchId: string, modelType: string): Promise<string> {
    const store = useQueueStore.getState();
    const { data: { user } } = await supabase.auth.getUser();
    
    const newJob: Job = {
      id: crypto.randomUUID(),
      user_id: user?.id,
      status: 'pending',
      type: 'text_extrapolation',
      payload: { description, model: modelType },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.addJob(newJob);

    try {
      await supabase.from('jobs').insert(newJob);

      store.updateJob(newJob.id, { status: 'processing' });
      await supabase.from('jobs').update({ status: 'processing' }).eq('id', newJob.id);

      const controller = new AbortController();
      this.controllers.set(newJob.id, controller);

      const response = await fetchWithTimeout('/api/inventory/extrapolate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          jobId: newJob.id,
          description,
          branchId,
          modelType
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

      this.controllers.delete(newJob.id);
      return newJob.id;

    } catch (error: any) {
      console.error('Text Extrapolation Failed:', error);
      store.updateJob(newJob.id, { status: 'failed', error: error.message });
      await supabase.from('jobs').update({ status: 'failed', error: error.message }).eq('id', newJob.id);
      throw error;
    }
  }
}
