// Import ColorThief only where it's used in the fallback method

/**
 * Calculate Euclidean distance between two RGB colors
 */
function colorDistance(color1: number[], color2: number[]): number {
  const dr = color1[0] - color2[0];
  const dg = color1[1] - color2[1];
  const db = color1[2] - color2[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Find minimum value in an array and return its index
 */
function minIndex(arr: number[]): number {
  let min = arr[0];
  let minIdx = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
      min = arr[i];
      minIdx = i;
    }
  }
  return minIdx;
}

/**
 * Perform k-means clustering on RGB colors
 * @param data - Array of RGB colors to cluster
 * @param k - Number of clusters to create
 * @returns Array of cluster centers (dominant colors)
 */
function kMeans(data: number[][], k: number): number[][] {
  if (data.length === 0) return [];
  if (data.length <= k) return data;
  
  // Initialize centroids randomly
  const centroids: number[][] = [];
  const used = new Set<number>();
  
  // Use k-means++ initialization for better results
  // First centroid is chosen randomly
  let idx = Math.floor(Math.random() * data.length);
  centroids.push([...data[idx]]);
  used.add(idx);
  
  // Choose remaining centroids with probability proportional to squared distance from existing centroids
  for (let i = 1; i < k; i++) {
    const distances: number[] = [];
    for (let j = 0; j < data.length; j++) {
      if (used.has(j)) {
        distances.push(0);
        continue;
      }
      
      // Find minimum distance to any existing centroid
      let minDist = Infinity;
      for (const centroid of centroids) {
        const dist = colorDistance(data[j], centroid);
        minDist = Math.min(minDist, dist);
      }
      distances.push(minDist * minDist); // Square distance for k-means++
    }
    
    // Sum of distances for probability calculation
    const sum = distances.reduce((a, b) => a + b, 0);
    if (sum === 0) break; // No more distinct points
    
    // Choose next centroid with probability proportional to squared distance
    let r = Math.random() * sum;
    let j = 0;
    while (r > 0 && j < distances.length) {
      r -= distances[j];
      j++;
    }
    j = Math.max(0, j - 1);
    
    centroids.push([...data[j]]);
    used.add(j);
  }
  
  // Main k-means algorithm
  const assignments = new Array(data.length).fill(0);
  const maxIterations = 10;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;
    
    // Assign points to the nearest centroid
    for (let i = 0; i < data.length; i++) {
      const distances = centroids.map(c => colorDistance(data[i], c));
      const newCluster = minIndex(distances);
      if (assignments[i] !== newCluster) {
        assignments[i] = newCluster;
        changed = true;
      }
    }
    
    // If no assignments changed, we've converged
    if (!changed && iter > 0) break;
    
    // Recalculate centroids
    const newCentroids: Array<[number, number, number, number]> = Array(k).fill(null).map(() => [0, 0, 0, 0]);
    
    for (let i = 0; i < data.length; i++) {
      const cluster = assignments[i];
      newCentroids[cluster][0] += data[i][0];
      newCentroids[cluster][1] += data[i][1];
      newCentroids[cluster][2] += data[i][2];
      newCentroids[cluster][3]++;
    }
    
    // Update centroids
    for (let i = 0; i < k; i++) {
      if (newCentroids[i][3] > 0) {
        centroids[i] = [
          Math.round(newCentroids[i][0] / newCentroids[i][3]),
          Math.round(newCentroids[i][1] / newCentroids[i][3]),
          Math.round(newCentroids[i][2] / newCentroids[i][3])
        ];
      }
    }
  }
  
  // Count how many points are assigned to each cluster
  const counts = new Array(k).fill(0);
  for (let i = 0; i < data.length; i++) {
    counts[assignments[i]]++;
  }
  
  // Sort clusters by size (number of points)
  const sortedIndices = counts.map((_, i) => i).sort((a, b) => counts[b] - counts[a]);
  const sortedCentroids = sortedIndices.map(i => centroids[i]);
  
  return sortedCentroids;
}

/**
 * Extract a color palette from an image element using k-means clustering
 * @param imageElement - The HTML image element to extract colors from
 * @param colorCount - Number of colors to extract
 * @returns Array of RGB colors in format [r, g, b]
 */
export const extractColors = async (
  imageElement: HTMLImageElement,
  colorCount: number = 8
): Promise<number[][]> => {
  try {
    // Make sure the image is fully loaded
    if (!imageElement.complete) {
      await new Promise((resolve) => {
        imageElement.onload = resolve;
      });
    }
    
    // Additional check to ensure the image is properly loaded with dimensions
    if (!imageElement.width || !imageElement.height) {
      console.error('Image has no dimensions:', imageElement.width, imageElement.height);
      throw new Error('Image has no dimensions');
    }
    
    console.log('Extracting colors from image:', imageElement.src);
    console.log('Image dimensions:', imageElement.width, 'x', imageElement.height);
    console.log('Requested color count:', colorCount);
    
    // Create a canvas element to draw the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Could not create canvas context');
    }
    
    // Set canvas dimensions
    canvas.width = Math.min(imageElement.width, 300);  // Limit size for performance
    canvas.height = Math.min(imageElement.height, 300);
    
    // Draw the image to the canvas
    ctx.drawImage(
      imageElement, 
      0, 0, imageElement.width, imageElement.height,
      0, 0, canvas.width, canvas.height
    );
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Sample pixels (similar to the p5js approach)
    const samples: number[][] = [];
    const pixelStep = 5; // Sample every 5 pixels
    
    for (let y = 0; y < canvas.height; y += pixelStep) {
      for (let x = 0; x < canvas.width; x += pixelStep) {
        const i = (y * canvas.width + x) * 4;
        
        // Skip transparent pixels
        if (pixels[i + 3] < 200) continue;
        
        // Skip very dark pixels (almost black)
        if (pixels[i] < 10 && pixels[i + 1] < 10 && pixels[i + 2] < 10) continue;
        
        // Skip very light pixels (almost white)
        if (pixels[i] > 245 && pixels[i + 1] > 245 && pixels[i + 2] > 245) continue;
        
        samples.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
      }
    }
    
    console.log(`Collected ${samples.length} color samples`);
    
    // Run k-means clustering to get dominant colors
    if (samples.length === 0) {
      throw new Error('No valid color samples found in image');
    }
    
    // If we only want one color, use the average
    if (colorCount === 1) {
      const avgColor = [0, 0, 0];
      for (const sample of samples) {
        avgColor[0] += sample[0];
        avgColor[1] += sample[1];
        avgColor[2] += sample[2];
      }
      avgColor[0] = Math.round(avgColor[0] / samples.length);
      avgColor[1] = Math.round(avgColor[1] / samples.length);
      avgColor[2] = Math.round(avgColor[2] / samples.length);
      
      return [avgColor];
    }
    
    // Otherwise perform k-means clustering
    const colors = kMeans(samples, colorCount);
    console.log('Extracted colors via k-means:', colors);
    
    return colors;
  } catch (error) {
    console.error('Error extracting colors:', error);
    
    // Return a default palette with various colors as a fallback
    const fallbackPalette = [
      [220, 50, 50],   // red
      [50, 180, 50],   // green
      [50, 50, 220],   // blue
      [220, 220, 50],  // yellow
      [220, 50, 220],  // magenta
      [50, 220, 220],  // cyan
      [220, 150, 50],  // orange
      [150, 50, 220]   // purple
    ];
    
    return fallbackPalette.slice(0, colorCount);
  }
};

/**
 * Convert RGB array to HEX string
 * @param rgb - RGB color array [r, g, b]
 * @returns HEX color string (#RRGGBB)
 */
export const rgbToHex = (rgb: number[]): string => {
  // Check if rgb is an array
  if (!Array.isArray(rgb) || rgb.length < 3) {
    console.error('Invalid RGB value:', rgb);
    return '#000000';
  }
  
  return '#' + rgb.slice(0, 3).map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Convert RGB array to CSS rgb() string
 * @param rgb - RGB color array [r, g, b] 
 * @returns CSS rgb color string
 */
export const rgbToString = (rgb: number[]): string => {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
};

/**
 * Get a random image URL from Lorem Picsum
 * @returns Promise with the URL of a random image
 */
export const getRandomImageUrl = async (): Promise<string> => {
  // Using Lorem Picsum for random images
  const width = window.innerWidth > 800 ? 800 : window.innerWidth;
  const height = Math.floor(width * 0.6);
  const randomId = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/id/${randomId}/${width}/${height}`;
};

/**
 * Convert RGB array to HSL values
 * @param rgb - RGB color array [r, g, b]
 * @returns HSL color values [h, s, l]
 */
export const rgbToHsl = (rgb: number[]): number[] => {
  // Check if rgb is an array
  if (!Array.isArray(rgb) || rgb.length < 3) {
    console.error('Invalid RGB value for HSL conversion:', rgb);
    return [0, 0, 0];
  }

  // Normalize RGB values to 0-1 range
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }

  // Convert to standard HSL ranges
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return [h, s, l];
};

/**
 * Convert RGB array to HSL string
 * @param rgb - RGB color array [r, g, b]
 * @returns HSL color string
 */
export const rgbToHslString = (rgb: number[]): string => {
  const hsl = rgbToHsl(rgb);
  return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
}; 