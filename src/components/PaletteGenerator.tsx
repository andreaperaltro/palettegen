import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import ImageUploader from './ImageUploader';
import ImagePreview from './ImagePreview';
import ColorPalette from './ColorPalette';
import ColorCountSlider from './ColorCountSlider';
import DownloadButton from './DownloadButton';
import ColorFormatSelector, { ColorFormat } from './ColorFormatSelector';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #f0f0f0;
  border: 0;
  
  @media (min-width: 1440px) {
    padding: 0 20px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  max-width: 1400px;
  margin: 0 auto;
  flex: 1;
  
  @media (min-width: 1024px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
  }
`;

const LeftColumn = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (min-width: 1024px) {
    width: 48%;
  }
`;

const RightColumn = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (min-width: 1024px) {
    width: 48%;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
  width: 100%;
  background-color: #000;
  color: #fff;
  padding: 20px;
  border: 0;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 3rem;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  
  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #fff;
  font-size: 1.2rem;
  margin: 0;
  font-family: monospace;
  
  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: #ff0000;
  color: #fff;
  padding: 15px;
  border: 3px solid #000;
  margin: 20px 0;
  text-align: center;
  width: 100%;
  max-width: 800px;
  font-weight: bold;
  text-transform: uppercase;
`;

const Footer = styled.footer`
  margin-top: 40px;
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 20px;
  border-top: 0;
  width: 100%;
  background-color: #000;
  color: #fff;
  font-family: monospace;
`;

const FormatControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 5px 0 15px 0;
  padding: 15px;
  background-color: #ddd;
  border: 3px solid #000;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
    
    & > * {
      margin: 10px;
    }
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoadingSpinner = styled.div`
  width: 80px;
  height: 80px;
  border: 10px solid #fff;
  border-radius: 0;
  border-top-color: #000;
  border-left-color: #000;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// State for our actual app
interface AppState {
  imageUrl: string | null;
  currentImage: HTMLImageElement | null;
  palette: number[][];
  colorCount: number;
  colorFormat: ColorFormat;
  loading: boolean;
  error: string | null;
}

const PaletteGenerator: React.FC = () => {
  // Create a state ref that won't cause re-renders
  const stateRef = useRef<AppState>({
    imageUrl: null,
    currentImage: null,
    palette: [],
    colorCount: 8,
    colorFormat: 'hex',
    loading: false,
    error: null
  });
  
  // Create minimal state for UI updates only
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<number[][]>([]);
  const [colorCount, setColorCount] = useState(8);
  const [colorFormat, setColorFormat] = useState<ColorFormat>('hex');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Update the state ref when these values change
  useEffect(() => {
    stateRef.current = {
      ...stateRef.current,
      imageUrl,
      palette,
      colorCount,
      colorFormat,
      loading,
      error
    };
  }, [imageUrl, palette, colorCount, colorFormat, loading, error]);
  
  // Load random image on initial component mount
  useEffect(() => {
    loadRandomImage();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  
  // Extract colors from the image with given count
  const extractColors = async (img: HTMLImageElement, count: number) => {
    try {
      setLoading(true);
      
      // Create a canvas to work with the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Could not create canvas context');
      
      // Set canvas dimensions
      canvas.width = Math.min(img.width, 300);
      canvas.height = Math.min(img.height, 300);
      
      // Draw the image to the canvas
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // Sample pixels
      const samples: number[][] = [];
      const pixelStep = 5;
      
      for (let y = 0; y < canvas.height; y += pixelStep) {
        for (let x = 0; x < canvas.width; x += pixelStep) {
          const i = (y * canvas.width + x) * 4;
          
          // Skip transparent/black/white pixels
          if (pixels[i + 3] < 200) continue;
          if (pixels[i] < 10 && pixels[i + 1] < 10 && pixels[i + 2] < 10) continue;
          if (pixels[i] > 245 && pixels[i + 1] > 245 && pixels[i + 2] > 245) continue;
          
          samples.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
        }
      }
      
      // Run k-means clustering
      const colors = await kMeans(samples, count);
      setPalette(colors);
      stateRef.current.palette = colors;
    } catch (err) {
      setError('Error extracting colors: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  // k-means clustering implementation for color extraction
  const kMeans = async (data: number[][], k: number): Promise<number[][]> => {
    return new Promise((resolve) => {
      if (data.length === 0) return resolve([]);
      if (data.length <= k) return resolve(data);
      
      // Initialize centroids randomly
      const centroids: number[][] = Array(k).fill(0).map(() => {
        const idx = Math.floor(Math.random() * data.length);
        return [...data[idx]];
      });
      
      const assignments = new Array(data.length).fill(0);
      const maxIterations = 10;
      
      // Helper function to calculate distance
      const colorDistance = (a: number[], b: number[]) => {
        const dr = a[0] - b[0];
        const dg = a[1] - b[1];
        const db = a[2] - b[2];
        return Math.sqrt(dr * dr + dg * dg + db * db);
      };
      
      // Execute iterations asynchronously to not block the UI
      let iteration = 0;
      
      const runIteration = () => {
        if (iteration >= maxIterations) {
          // Done with iterations, return the result
          return resolve(centroids);
        }
        
        // Assign points to centroids
        let changed = false;
        for (let i = 0; i < data.length; i++) {
          const distances = centroids.map(c => colorDistance(data[i], c));
          const closestIdx = distances.indexOf(Math.min(...distances));
          
          if (assignments[i] !== closestIdx) {
            assignments[i] = closestIdx;
            changed = true;
          }
        }
        
        // If no assignments changed, we're done
        if (!changed && iteration > 0) {
          return resolve(centroids);
        }
        
        // Recalculate centroids
        const newCentroids: number[][] = Array(k).fill(0).map(() => [0, 0, 0, 0]);
        
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
        
        iteration++;
        setTimeout(runIteration, 0); // Continue on next tick to keep UI responsive
      };
      
      runIteration();
    });
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }
    
    setLoading(true);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        
        // Create image element
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
          stateRef.current.currentImage = img;
          stateRef.current.imageUrl = dataUrl;
          setImageUrl(dataUrl);
          extractColors(img, stateRef.current.colorCount);
        };
        
        img.onerror = () => {
          setError('Failed to load image');
          setLoading(false);
        };
        
        img.src = dataUrl;
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read the file');
      setLoading(false);
    };
    
    reader.readAsDataURL(file);
  };
  
  // Load a random image
  const loadRandomImage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const width = window.innerWidth > 800 ? 800 : window.innerWidth;
      const height = Math.floor(width * 0.6);
      const randomId = Math.floor(Math.random() * 1000);
      const url = `https://picsum.photos/id/${randomId}/${width}/${height}`;
      
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        stateRef.current.currentImage = img;
        stateRef.current.imageUrl = url;
        setImageUrl(url);
        extractColors(img, stateRef.current.colorCount);
      };
      
      img.onerror = () => {
        // Try without ID if it fails
        const fallbackUrl = `https://picsum.photos/${width}/${height}?random=${Math.random()}`;
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = 'Anonymous';
        
        fallbackImg.onload = () => {
          stateRef.current.currentImage = fallbackImg;
          stateRef.current.imageUrl = fallbackUrl;
          setImageUrl(fallbackUrl);
          extractColors(fallbackImg, stateRef.current.colorCount);
        };
        
        fallbackImg.onerror = () => {
          setError('Failed to load random image');
          setLoading(false);
        };
        
        fallbackImg.src = fallbackUrl;
      };
      
      img.src = url;
    } catch (err) {
      setError('Error loading random image: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };
  
  // Handle color count change (without reloading the image)
  const handleColorCountChange = (count: number) => {
    setColorCount(count);
    stateRef.current.colorCount = count;
    
    if (stateRef.current.currentImage) {
      extractColors(stateRef.current.currentImage, count);
    }
  };
  
  // Handle color format change
  const handleFormatChange = (format: ColorFormat) => {
    setColorFormat(format);
  };
  
  return (
    <Container>
      <Header>
        <Title>Palette Generator</Title>
        <Subtitle>Extract beautiful color palettes from any image</Subtitle>
      </Header>
      
      <ContentWrapper>
        <LeftColumn>
          <ImageUploader
            onImageUpload={handleImageUpload}
            onRandomImage={loadRandomImage}
            loading={loading}
          />
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <ImagePreview 
            imageUrl={imageUrl} 
            loading={false}
          />
        </LeftColumn>
        
        <RightColumn>
          {imageUrl && (
            <FormatControlsContainer>
              <ColorCountSlider
                colorCount={colorCount}
                onChange={handleColorCountChange}
                min={1}
                max={16}
              />
              
              <ColorFormatSelector
                format={colorFormat}
                onChange={handleFormatChange}
              />
            </FormatControlsContainer>
          )}
          
          {palette.length > 0 && (
            <>
              <ColorPalette 
                palette={palette} 
                format={colorFormat}
              />
              <DownloadButton 
                palette={palette} 
                disabled={loading}
              />
            </>
          )}
        </RightColumn>
      </ContentWrapper>
      
      {loading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}
      
      <Footer>
        Click on a color to see all color formats (HEX, RGB, HSL).<br />
        Click on any value to copy it to your clipboard.<br />
        Use the slider to adjust the number of colors in the palette.<br />
        Select your preferred color format with the format buttons.<br />
        Download the palette as an image or JSON file for your projects.
      </Footer>
    </Container>
  );
};

export default PaletteGenerator; 