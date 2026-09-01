import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET_NAME = 'product-images';

export interface UploadedImageResult {
  url: string;
  name: string;
  size: number;
}

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file type "${file.type}". Allowed formats: JPG, JPEG, PNG, WEBP.`,
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File "${file.name}" is ${sizeInMB}MB. Maximum allowed size is 5MB.`,
    };
  }

  return { valid: true };
};

/**
 * Converts a File to a base64 Data URL (useful for immediate local previews and fallback storage)
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads an image file to Supabase Storage bucket 'product-images'.
 * If Supabase is not configured or fails, falls back gracefully to a high-quality Data URL.
 */
export const uploadProductImage = async (
  file: File,
  folder = 'jerseys'
): Promise<UploadedImageResult> => {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid file');
  }

  // Attempt Supabase Storage Upload if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const filePath = `${folder}/${timestamp}-${randomStr}-${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return {
            url: publicUrlData.publicUrl,
            name: file.name,
            size: file.size,
          };
        }
      } else if (error) {
        console.warn('Supabase storage upload error, falling back to local data URL:', error.message);
      }
    } catch (err) {
      console.warn('Supabase storage exception, using fallback:', err);
    }
  }

  // Fallback: create base64 data URL
  const dataUrl = await fileToDataUrl(file);
  return {
    url: dataUrl,
    name: file.name,
    size: file.size,
  };
};

/**
 * Deletes an image from Supabase Storage if it belongs to the bucket
 */
export const deleteProductImage = async (imageUrl: string): Promise<boolean> => {
  if (!isSupabaseConfigured || !supabase || !imageUrl) return true;

  try {
    if (imageUrl.includes(BUCKET_NAME)) {
      const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
      if (urlParts.length > 1) {
        const filePath = decodeURIComponent(urlParts[1].split('?')[0]);
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      }
    }
    return true;
  } catch (err) {
    console.warn('Failed to remove image from storage:', err);
    return false;
  }
};
