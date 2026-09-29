import { useState } from 'react';
import emptyImageIcon from '@/assets/icons/empty image.svg';
import { cn } from '@/lib/utils';

interface OutfitImageProps {
  imageUrl?: string;
  alt: string;
  className?: string;
}

export default function OutfitImage({ imageUrl, alt, className }: OutfitImageProps) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL?.replace(/\/+$/, '');
  const src = imageUrl
    ? /^(https?:)?\/\//i.test(imageUrl)
      ? imageUrl
      : `${imageBaseUrl || ''}/${imageUrl.replace(/^\/+/, '')}`
    : undefined;

  if (!src || failedUrl === src) {
    return (
      <div
        role="img"
        aria-label={`${alt} (이미지 없음)`}
        className={cn('flex h-full w-full items-center justify-center bg-gray-100', className)}
      >
        <img src={emptyImageIcon} alt="" className="h-12 w-12 max-h-full max-w-full" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailedUrl(src)}
      className={cn('h-full w-full object-cover', className)}
    />
  );
}
