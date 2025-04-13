import React from 'react';
import styled from 'styled-components';

export type ColorFormat = 'hex' | 'rgb' | 'hsl';

interface ColorFormatSelectorProps {
  format: ColorFormat;
  onChange: (format: ColorFormat) => void;
}

const SelectorContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 15px auto;
  background-color: #f5f5f5;
  border: 2px solid #000;
  padding: 5px;
  width: fit-content;
  
  @media (max-width: 600px) {
    width: 100%;
    max-width: 300px;
  }
`;

const FormatButton = styled.button<{ active: boolean }>`
  background-color: ${props => props.active ? '#000' : 'transparent'};
  color: ${props => props.active ? 'white' : '#000'};
  border: 2px solid #000;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  font-family: monospace;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  flex: 1;
  
  &:hover {
    background-color: ${props => props.active ? '#000' : '#ddd'};
  }
  
  &:not(:last-child) {
    margin-right: 5px;
  }
`;

const ColorFormatSelector: React.FC<ColorFormatSelectorProps> = ({ format, onChange }) => {
  return (
    <SelectorContainer>
      <FormatButton 
        active={format === 'hex'} 
        onClick={() => onChange('hex')}
      >
        HEX
      </FormatButton>
      <FormatButton 
        active={format === 'rgb'} 
        onClick={() => onChange('rgb')}
      >
        RGB
      </FormatButton>
      <FormatButton 
        active={format === 'hsl'} 
        onClick={() => onChange('hsl')}
      >
        HSL
      </FormatButton>
    </SelectorContainer>
  );
};

export default ColorFormatSelector; 