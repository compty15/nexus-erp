import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  // 1. Handle HEIC/HEIF (common on iPhones)
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || 
                 file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

  let activeFile = file;

  if (isHeic) {
    try {
      console.log('HEIC detected, converting...');
      const heic2any = (await import('heic2any')).default;
      const blob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      });
      activeFile = new File([Array.isArray(blob) ? blob[0] : blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
    } catch (err) {
      console.error('HEIC conversion failed:', err);
      // Fallback to original file and hope the compression library or Gemini can handle it
    }
  }

  const options = {
    maxSizeMB: 4,
    maxWidthOrHeight: 4000,
    useWebWorker: true,
    fileType: 'image/jpeg' as any, // Forcing JPEG as it's the most robust for all Gemini versions
  };

  // 2. Handle Problematic types like DNG (Adobe Raw)
  const isDng = activeFile.type === 'image/x-adobe-dng' || activeFile.name.toLowerCase().endsWith('.dng');

  try {
    const compressedFile = await imageCompression(activeFile, options);
    return compressedFile;
  } catch (error) {
    console.error('Initial compression failed, attempting hard conversion:', error);
    
    // Hard conversion fallback using Canvas
    try {
      return await hardConvertImage(activeFile);
    } catch (hardError) {
      console.error('Hard conversion failed:', hardError);
      return activeFile;
    }
  }
}

/**
 * Uses the browser's native image decoding to draw to a canvas and export as JPEG.
 * This can often handle formats the compression library misses if the OS supports them.
 */
async function hardConvertImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context failed'));
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Canvas blob failed'));
        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
        resolve(newFile);
      }, 'image/jpeg', 0.9);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed during hard conversion'));
    };
    img.src = url;
  });
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}
