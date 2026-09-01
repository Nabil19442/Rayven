import { supabase, isSupabaseConfigured } from './supabase';

export const STORAGE_BUCKET = 'app-files';

export interface UploadedFileResult {
  filePath: string;     // relative storage path: ${userId}/${featureName}/${itemId}/${uuid}.${extension}
  signedUrl: string;    // signed temporary access URL for immediate display
  url: string;          // alias for signedUrl / backward compatibility
  name: string;
  size: number;
}

// In-memory cache for signed URLs to prevent redundant network calls
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSizeBytes = 10 * 1024 * 1024; // 10 MB

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file type "${file.type}". Allowed formats: JPG, JPEG, PNG, WEBP, GIF.`,
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File "${file.name}" is ${sizeInMB}MB. Maximum allowed size is 10MB.`,
    };
  }

  return { valid: true };
};

/**
 * Converts a File to a base64 Data URL (useful for local fallback)
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
 * Helper to get the current authenticated user ID
 */
export const getCurrentUserId = async (): Promise<string> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) return session.user.id;
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) return user.id;
    } catch {
      // Fall through to anonymous identifier
    }
  }
  return 'anonymous-user';
};

/**
 * Uploads a file to Supabase Storage bucket 'app-files' with user folder isolation:
 * Path format: ${userId}/${featureName}/${itemId}/${uuid}.${extension}
 */
export const uploadAppFile = async ({
  file,
  featureName = 'uploads',
  itemId = 'general',
  userId: explicitUserId,
}: {
  file: File;
  featureName?: string;
  itemId?: string;
  userId?: string;
}): Promise<UploadedFileResult> => {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid file');
  }

  const userId = explicitUserId || (await getCurrentUserId());
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanExt = fileExt.replace(/[^a-z0-9]/g, '');
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  const cleanItemId = (itemId || 'item').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanFeature = (featureName || 'general').replace(/[^a-zA-Z0-9_-]/g, '_');

  // Enforce folder rule: ${auth.uid()}/${featureName}/${itemId}/${uuid}.${extension}
  const filePath = `${userId}/${cleanFeature}/${cleanItemId}/${uniqueId}.${cleanExt}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        // Generate signed URL since bucket is private
        const { data: signedData, error: signError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days expiration

        const resolvedUrl = (!signError && signedData?.signedUrl) ? signedData.signedUrl : filePath;

        // Cache signed URL
        if (signedData?.signedUrl) {
          signedUrlCache.set(filePath, {
            url: signedData.signedUrl,
            expiresAt: Date.now() + (60 * 60 * 24 * 6 * 1000),
          });
        }

        return {
          filePath,
          signedUrl: resolvedUrl,
          url: resolvedUrl,
          name: file.name,
          size: file.size,
        };
      } else if (error) {
        console.warn('Supabase storage upload error, falling back:', error.message);
      }
    } catch (err) {
      console.warn('Supabase storage upload exception:', err);
    }
  }

  // Fallback if offline / demo mode
  const dataUrl = await fileToDataUrl(file);
  return {
    filePath,
    signedUrl: dataUrl,
    url: dataUrl,
    name: file.name,
    size: file.size,
  };
};

/**
 * Backward compatibility wrapper for product uploads
 */
export const uploadProductImage = async (
  file: File,
  folder = 'products',
  productId = 'new'
): Promise<UploadedFileResult> => {
  return uploadAppFile({
    file,
    featureName: folder,
    itemId: productId,
  });
};

/**
 * Extracts clean relative storage path from any URL or path string
 */
export const extractStoragePath = (filePathOrUrl: string): string | null => {
  if (!filePathOrUrl) return null;
  if (filePathOrUrl.startsWith('data:')) return null;

  // If already relative path
  if (!filePathOrUrl.startsWith('http://') && !filePathOrUrl.startsWith('https://')) {
    return filePathOrUrl.replace(/^app-files\//, '');
  }

  // If it's a Supabase storage URL (signed or public)
  if (filePathOrUrl.includes(`/${STORAGE_BUCKET}/`)) {
    const parts = filePathOrUrl.split(`/${STORAGE_BUCKET}/`);
    if (parts.length > 1) {
      return decodeURIComponent(parts[1].split('?')[0]);
    }
  }

  return null;
};

/**
 * Generates or retrieves a signed URL for a private storage path
 */
export const getSignedFileUrl = async (
  filePathOrUrl: string,
  expiresInSeconds = 60 * 60 * 24 // 24 hours
): Promise<string> => {
  if (!filePathOrUrl) return '';

  // External URLs (Unsplash, external CDNs, Data URLs) don't need Supabase signing
  if (
    filePathOrUrl.startsWith('data:') ||
    (filePathOrUrl.startsWith('http') && !filePathOrUrl.includes(`/${STORAGE_BUCKET}/`))
  ) {
    return filePathOrUrl;
  }

  const cleanPath = extractStoragePath(filePathOrUrl);
  if (!cleanPath) return filePathOrUrl;

  // Check cache first
  const cached = signedUrlCache.get(cleanPath);
  if (cached && cached.expiresAt > Date.now() + 60000) {
    return cached.url;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(cleanPath, expiresInSeconds);

      if (!error && data?.signedUrl) {
        signedUrlCache.set(cleanPath, {
          url: data.signedUrl,
          expiresAt: Date.now() + ((expiresInSeconds - 60) * 1000),
        });
        return data.signedUrl;
      }
    } catch (err) {
      console.warn('Error creating signed URL for', cleanPath, err);
    }
  }

  return filePathOrUrl;
};

/**
 * Resolves a list of image paths/URLs into signed URLs
 */
export const resolveImageUrls = async (urls: string[]): Promise<string[]> => {
  if (!urls || urls.length === 0) return [];
  return Promise.all(urls.map((url) => getSignedFileUrl(url)));
};

/**
 * Deletes a file from Supabase Storage 'app-files' bucket
 */
export const deleteAppFile = async (filePathOrUrl: string): Promise<boolean> => {
  if (!filePathOrUrl) return true;

  const cleanPath = extractStoragePath(filePathOrUrl);
  if (!cleanPath) return true;

  // Remove from cache
  signedUrlCache.delete(cleanPath);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([cleanPath]);

      if (error) {
        console.warn('Supabase storage file removal error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Failed to delete file from storage:', err);
      return false;
    }
  }

  return true;
};

/**
 * Alias for backward compatibility
 */
export const deleteProductImage = deleteAppFile;
