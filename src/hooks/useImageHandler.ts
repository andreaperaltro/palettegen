import { useState, useCallback } from 'react';
import { extractColors, getRandomImageUrl } from '../utils/colorExtractor';

// Extend the Window interface to include our cached image properties
declare global {
  interface Window {
    __cachedImage?: HTMLImageElement;
    __cachedImageSrc?: string;
  }
}

interface UseImageHandlerResult {
  imageUrl: string | null;
  palette: number[][];
  loading: boolean;
  error: string | null;
  colorCount: number;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loadRandomImage: () => Promise<void>;
  setColorCount: (count: number) => void;
}

export const useImageHandler = (): UseImageHandlerResult => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<number[][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [colorCount, setColorCount] = useState<number>(8);

  const processImage = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      // Add a cache-busting parameter to avoid CORS issues with cached images
      const urlWithCacheBust = url.includes('?') && !url.startsWith('data:') 
        ? `${url}&cache=${Date.now()}` 
        : url.startsWith('data:') ? url : `${url}?cache=${Date.now()}`;
      
      img.src = urlWithCacheBust;
      
      // Wait for the image to load
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        
        // Set a timeout to avoid hanging if the image load takes too long
        setTimeout(() => reject(new Error('Image loading timed out')), 10000);
      });
      
      // Cache the image for future color extractions
      window.__cachedImage = img;
      window.__cachedImageSrc = url;
      
      // Extract colors from the image
      console.log('Processing image with color count:', colorCount);
      const colors = await extractColors(img, colorCount);
      
      if (!colors || colors.length === 0) {
        throw new Error('Could not extract colors from image');
      }
      
      console.log('Extracted palette with', colors.length, 'colors');
      setPalette(colors);
      setImageUrl(url);
    } catch (err) {
      setError('Error processing image: ' + (err instanceof Error ? err.message : String(err)));
      throw err; // Rethrow to allow for fallback handling
    } finally {
      setLoading(false);
    }
  }, [colorCount]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        processImage(event.target.result as string)
          .catch(err => {
            console.error('Error processing uploaded image:', err);
            // Error already set by processImage function
          });
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read the uploaded file');
      setLoading(false);
    };
    
    reader.readAsDataURL(file);
  }, [processImage]);

  const loadRandomImage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = await getRandomImageUrl();
      
      // Try to load the image with specific ID
      try {
        await processImage(url);
      } catch (err) {
        // Fallback to generic random image if specific ID fails
        console.log('Falling back to generic Lorem Picsum URL');
        const width = window.innerWidth > 800 ? 800 : window.innerWidth;
        const height = Math.floor(width * 0.6);
        const fallbackUrl = `https://picsum.photos/${width}/${height}?random=${Math.random()}`;
        await processImage(fallbackUrl);
      }
    } catch (err) {
      setError('Error loading random image: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [processImage]);

  // Helper function to extract colors and update state
  const extractColorsAndUpdate = useCallback(async (img: HTMLImageElement, count: number) => {
    try {
      console.log('Reprocessing image with new color count:', count);
      const colors = await extractColors(img, count);
      
      if (colors && colors.length > 0) {
        console.log('Updated palette to', colors.length, 'colors');
        setPalette(colors);
      }
    } catch (err) {
      console.error('Error reprocessing colors with new count:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update the function to update color count and reprocess the palette without reloading the image
  const updateColorCount = useCallback((count: number) => {
    setColorCount(count);
    
    // Only reprocess the palette if we already have an image
    if (imageUrl) {
      setLoading(true);
      
      // Create an image object only once and reuse it
      if (window.__cachedImage && window.__cachedImageSrc === imageUrl) {
        // Use the cached image if we already have it
        console.log('Using cached image for color extraction');
        extractColorsAndUpdate(window.__cachedImage, count);
      } else {
        // Load the image if not cached
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;
        
        img.onload = () => {
          // Cache the image for future updates
          window.__cachedImage = img;
          window.__cachedImageSrc = imageUrl;
          extractColorsAndUpdate(img, count);
        };
        
        img.onerror = () => {
          console.error('Failed to load image for color count update');
          setLoading(false);
        };
      }
    }
  }, [imageUrl, extractColorsAndUpdate]);

  return {
    imageUrl,
    palette,
    loading,
    error,
    colorCount,
    handleImageUpload,
    loadRandomImage,
    setColorCount: updateColorCount
  };
}; 