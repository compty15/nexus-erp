import { supabase } from './supabase';

export async function uploadToStorage(file: File, bucket = 'raw_images'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const { data: { user } } = await supabase.auth.getUser();
  const filePath = user ? `${user.id}/${fileName}` : fileName;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Storage Upload Error: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  
  return { path: filePath, publicUrl: data.publicUrl };
}

export async function deleteFromStorage(paths: string[], bucket = 'raw_images'): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths);

  if (error) {
    console.error(`Storage Deletion Error: ${error.message}`);
  }
}
