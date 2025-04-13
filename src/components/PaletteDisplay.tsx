import React, { useState } from 'react';
import styled from 'styled-components';

const PaletteContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  margin: 20px 0;
  border: 3px solid #000;
  background-color: #eee;
`;

const ColorsContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100px;
`;

const ColorBlock = styled.div<{ color: string }>`
  flex: 1;
  background-color: ${(props) => props.color};
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
  border-right: 3px solid #000;

  &:last-child {
    border-right: none;
  }

  &:hover {
    transform: translateY(-5px);
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30px;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover::after {
    opacity: 1;
    content: "Copy";
    color: white;
    font-weight: bold;
    font-family: monospace;
    text-transform: uppercase;
  }
`;

const Title = styled.h3`
  font-size: 18px;
  margin: 0;
  padding: 15px;
  font-weight: bold;
  text-transform: uppercase;
  font-family: monospace;
  border-bottom: 3px solid #000;
  background-color: #ddd;
`;

const ButtonContainer = styled.div`
  display: flex;
  border-top: 3px solid #000;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  background-color: transparent;
  font-weight: bold;
  text-transform: uppercase;
  font-family: monospace;
  cursor: pointer;
  border-right: 3px solid #000;
  transition: background-color 0.2s, color 0.2s;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background-color: #000;
    color: #fff;
  }
`;

const ColorInfo = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px;
  border-top: 3px solid #000;
  font-family: monospace;
`;

const ColorInfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid #ccc;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-weight: bold;
  text-transform: uppercase;
`;

const Message = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #000;
  color: #fff;
  padding: 10px 15px;
  border: 3px solid #000;
  font-family: monospace;
  text-transform: uppercase;
  z-index: 1000;
  animation: fadeOut 2s forwards;
  animation-delay: 1s;

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

const PaletteDisplay: React.FC = () => {
  const [palette, setPalette] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generatePalette = () => {
    // Implementation of generatePalette function
  };

  const copyToClipboard = (color: string) => {
    // Implementation of copyToClipboard function
  };

  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "rgb(0, 0, 0)";
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "hsl(0, 0%, 0%)";
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
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

    // Convert to degrees and percentages
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  const onRegenerateClick = () => {
    // Implementation of onRegenerateClick function
  };

  const onSave = (palette: string[]) => {
    // Implementation of onSave function
  };

  return (
    <PaletteContainer>
      <Title>Generated Palette</Title>
      <ColorsContainer>
        {palette.map((color, index) => (
          <ColorBlock
            key={index}
            color={color}
            onClick={() => {
              setSelectedColor(color);
              copyToClipboard(color);
            }}
          />
        ))}
      </ColorsContainer>
      <ColorInfo>
        {selectedColor && (
          <>
            <ColorInfoItem>
              <Label>HEX</Label>
              <span>{selectedColor}</span>
            </ColorInfoItem>
            <ColorInfoItem>
              <Label>RGB</Label>
              <span>{hexToRgb(selectedColor)}</span>
            </ColorInfoItem>
            <ColorInfoItem>
              <Label>HSL</Label>
              <span>{hexToHsl(selectedColor)}</span>
            </ColorInfoItem>
          </>
        )}
      </ColorInfo>
      <ButtonContainer>
        <ActionButton onClick={onRegenerateClick}>Regenerate</ActionButton>
        <ActionButton onClick={() => onSave(palette)}>Save Palette</ActionButton>
      </ButtonContainer>
      {copied && <Message>Color copied to clipboard!</Message>}
    </PaletteContainer>
  );
};

export default PaletteDisplay; 