import React from 'react';
import styled from 'styled-components';
import { rgbToHex, rgbToHsl } from '../utils/colorExtractor';

interface DownloadButtonProps {
  palette: number[][];
  disabled: boolean;
}

const ButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
  width: 100%;
  
  @media (max-width: 500px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Button = styled.button`
  background-color: #000;
  color: white;
  border: 3px solid #000;
  border-radius: 0;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  font-family: monospace;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s;
  width: 100%;
  
  &:hover {
    background-color: #fff;
    color: #000;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    background-color: #aaa;
    border-color: #aaa;
    color: #eee;
    cursor: not-allowed;
  }
`;

const DownloadButton: React.FC<DownloadButtonProps> = ({ palette, disabled }) => {
  const handleImageDownload = () => {
    // Create a canvas to draw the palette
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas dimensions
    const swatchWidth = 100;
    const swatchHeight = 300;
    const margin = 20;
    const titleHeight = 60;
    
    canvas.width = (palette.length * swatchWidth) + (margin * 2);
    canvas.height = swatchHeight + (margin * 2) + titleHeight;
    
    // Adjust width if too narrow
    if (canvas.width < 300) {
      canvas.width = 300;
    }
    
    // Fill background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Color Palette (${palette.length} Colors)`, canvas.width / 2, 40);
    
    // Calculate swatch width based on palette length and available space
    const actualSwatchWidth = palette.length === 1 
      ? canvas.width - (margin * 2) 
      : (canvas.width - (margin * 2)) / palette.length;
    
    // Draw color swatches
    palette.forEach((color, index) => {
      const x = margin + (index * actualSwatchWidth);
      const y = margin + titleHeight;
      
      // Draw color swatch
      ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      ctx.fillRect(x, y, actualSwatchWidth, swatchHeight);
      
      // Draw hex code
      const hexCode = '#' + color.slice(0, 3).map(c => {
        const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
      
      ctx.fillStyle = '#333';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      
      // Add white background to text for better visibility
      const textX = x + (actualSwatchWidth / 2);
      const textY = y + swatchHeight + 15;
      ctx.fillStyle = 'white';
      ctx.fillRect(textX - 30, textY - 10, 60, 14);
      
      // Draw the text
      ctx.fillStyle = '#333';
      ctx.fillText(hexCode, textX, textY);
    });
    
    // Convert canvas to image and download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    link.download = `palette_${timestamp}.png`;
    link.href = dataUrl;
    link.click();
  };
  
  const handleJsonDownload = () => {
    // Create an object with color information
    const colorData = palette.map(color => {
      const hexColor = rgbToHex(color);
      const hsl = rgbToHsl(color);
      return {
        hex: hexColor,
        rgb: {
          r: color[0],
          g: color[1],
          b: color[2]
        },
        hsl: {
          h: hsl[0],
          s: hsl[1],
          l: hsl[2]
        }
      };
    });
    
    // Convert to JSON string
    const jsonString = JSON.stringify({
      colors: colorData,
      count: palette.length,
      timestamp: new Date().toISOString()
    }, null, 2);
    
    // Create a blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    link.download = `palette_${timestamp}.json`;
    link.href = url;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  };
  
  return (
    <ButtonsContainer>
      <Button onClick={handleImageDownload} disabled={disabled}>
        Download as Image
      </Button>
      <Button onClick={handleJsonDownload} disabled={disabled}>
        Download as JSON
      </Button>
    </ButtonsContainer>
  );
};

export default DownloadButton; 