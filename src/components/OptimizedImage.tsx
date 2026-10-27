import React, { useState } from 'react';
import { getOptimizedImageUrl } from '../utils/image';
import { Utensils } from 'lucide-react';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  widthParam?: number;
  qualityParam?: number;
  className?: string;
  containerClassName?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  widthParam = 480,
  qualityParam = 65,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = getOptimizedImageUrl(src, {
    width: widthParam,
    quality: qualityParam,
  });

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Shimmer skeleton while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-stone-200/80 animate-pulse flex items-center justify-center">
          <Utensils className="w-5 h-5 text-stone-300 animate-spin" />
        </div>
      )}

      {/* Fallback state on error */}
      {hasError ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-2">
          <Utensils className="w-6 h-6 mb-1 opacity-50" />
          <span className="text-[10px] font-medium text-stone-500">Dish preview</span>
        </div>
      ) : (
        <img
          src={optimizedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
};
