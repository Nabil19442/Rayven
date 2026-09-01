import React, { useState, useEffect } from 'react';
import { getSignedFileUrl } from '../lib/storage';

interface StorageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
}

/**
 * StorageImage seamlessly resolves private Supabase Storage paths ('app-files/...')
 * into temporary signed URLs with local caching and fallback handling.
 */
export const StorageImage: React.FC<StorageImageProps> = ({
  src,
  fallbackSrc = 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
  alt = 'Image',
  className = '',
  ...props
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!src) {
      setResolvedSrc(fallbackSrc);
      return;
    }

    // If it's already an external data or http URL (and not our private storage path)
    if (src.startsWith('data:') || (src.startsWith('http') && !src.includes('/app-files/'))) {
      setResolvedSrc(src);
      return;
    }

    getSignedFileUrl(src)
      .then((signed) => {
        if (isMounted && signed) {
          setResolvedSrc(signed);
        }
      })
      .catch(() => {
        if (isMounted) {
          setResolvedSrc(fallbackSrc);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src, fallbackSrc]);

  return (
    <img
      src={hasError ? fallbackSrc : resolvedSrc}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
};
