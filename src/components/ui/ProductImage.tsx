'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  imagePath: string | null | undefined;
  alt:       string;
  className?: string;
  iconSize?:  string;
}

export function ProductImage({
  imagePath,
  alt,
  className,
  iconSize = 'h-12 w-12',
}: ProductImageProps) {
  const [error, setError] = useState(false);

  const url = getImageUrl(imagePath);
  const hasImage = !!imagePath && !error && url !== '/placeholder-product.png';

  if (!hasImage) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted/30',
          className
        )}
      >
        <Package className={cn(iconSize, 'text-muted-foreground/30')} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className={cn('object-contain', className)}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}