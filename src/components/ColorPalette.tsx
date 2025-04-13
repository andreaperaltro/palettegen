import React, { useState, memo } from 'react';
import styled from 'styled-components';
import { rgbToHex, rgbToString, rgbToHslString } from '../utils/colorExtractor';
import { ColorFormat } from './ColorFormatSelector';

interface ColorPaletteProps {
  palette: number[][];
  format: ColorFormat;
}

const PaletteContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  width: 100%;
  margin: 20px 0;
  padding: 15px;
  background-color: #eee;
  border: 3px solid #000;

  @media (max-width: 600px) {
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 10px;
  }
`;

const ColorSwatch = styled.div<{ background: string }>`
  background-color: ${props => props.background};
  border: 3px solid #000;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 8px;
  transition: transform 0.2s;
  position: relative;

  &:hover {
    transform: translateY(-5px);
  }

  @media (max-width: 600px) {
    height: 100px;
  }
`;

const ColorInfo = styled.div`
  background-color: #fff;
  color: #000;
  border: 2px solid #000;
  padding: 4px 8px;
  font-size: 12px;
  font-family: monospace;
  width: calc(100% - 16px);
  text-align: center;
  cursor: pointer;
  position: relative;
  margin-top: auto;
  font-weight: bold;
  text-transform: uppercase;
`;

const ColorTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  background-color: #000;
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 100;
  visibility: hidden;
  opacity: 0;
  transition: visibility 0s, opacity 0.3s;
  font-family: monospace;
  text-transform: uppercase;
  border: 2px solid #000;

  ${ColorInfo}:hover & {
    visibility: visible;
    opacity: 1;
  }

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #000 transparent transparent transparent;
  }
`;

const ColorValues = styled.div`
  position: absolute;
  bottom: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  width: 170px;
  background-color: white;
  box-shadow: none;
  padding: 8px;
  z-index: 10;
  border: 3px solid #000;
  
  @media (max-width: 600px) {
    width: 150px;
  }
`;

const ColorValueItem = styled.div`
  font-size: 12px;
  font-family: monospace;
  margin: 3px 0;
  padding: 4px 0;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #000;
  
  &:last-child {
    border-bottom: none;
  }
  
  span {
    cursor: pointer;
    &:hover {
      background-color: #000;
      color: #fff;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background: #000;
  color: #fff;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 2px 6px;
  line-height: 1;
  font-weight: bold;
  
  &:hover {
    background-color: #fff;
    color: #000;
  }
`;

const ColorPalette: React.FC<ColorPaletteProps> = memo(({ palette, format }) => {
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // You could add a toast notification here
        console.log('Copied to clipboard:', text);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  const handleSwatchClick = (index: number) => {
    setSelectedColor(selectedColor === index ? null : index);
  };

  // Function to get the color string based on format
  const getColorString = (color: number[]): string => {
    switch (format) {
      case 'rgb':
        return rgbToString(color);
      case 'hsl':
        return rgbToHslString(color);
      case 'hex':
      default:
        return rgbToHex(color);
    }
  };

  return (
    <PaletteContainer>
      {palette.map((color, index) => {
        const hexColor = rgbToHex(color);
        const displayColor = getColorString(color);
        
        return (
          <ColorSwatch 
            key={index} 
            background={hexColor}
            onClick={() => handleSwatchClick(index)}
          >
            {selectedColor === index && (
              <ColorValues>
                <CloseButton onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(null);
                }}>×</CloseButton>
                <ColorValueItem>
                  HEX: <span onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(rgbToHex(color));
                  }}>{rgbToHex(color)}</span>
                </ColorValueItem>
                <ColorValueItem>
                  RGB: <span onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(rgbToString(color));
                  }}>{rgbToString(color)}</span>
                </ColorValueItem>
                <ColorValueItem>
                  HSL: <span onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(rgbToHslString(color));
                  }}>{rgbToHslString(color)}</span>
                </ColorValueItem>
              </ColorValues>
            )}
            <ColorInfo onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(displayColor);
            }}>
              {displayColor}
              <ColorTooltip>Click to copy</ColorTooltip>
            </ColorInfo>
          </ColorSwatch>
        );
      })}
    </PaletteContainer>
  );
});

export default ColorPalette; 