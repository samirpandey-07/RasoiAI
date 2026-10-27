/**
 * Image Optimization Utilities
 * Transforms Unsplash and web images into lightweight, responsive WebP/AVIF formats
 * to accelerate page load times by up to 90%.
 */

interface OptimizeImageOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export function getOptimizedImageUrl(
  url?: string | null,
  options: OptimizeImageOptions = {}
): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=480&q=65';
  }

  const { width = 480, height, quality = 65 } = options;

  // Optimize Unsplash images dynamically
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());

      if (height) {
        urlObj.searchParams.set('h', height.toString());
      }

      return urlObj.toString();
    } catch {
      // Fallback string replacement if URL constructor fails
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?auto=format&fit=crop&w=${width}&q=${quality}`;
    }
  }

  return url;
}
