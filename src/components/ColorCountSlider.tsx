import React from 'react';
import styled from 'styled-components';

interface ColorCountSliderProps {
  colorCount: number;
  onChange: (count: number) => void;
  min?: number;
  max?: number;
}

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 500px;
  margin: 15px auto;
  padding: 10px;
  background-color: #f5f5f5;
  border: 2px solid #000;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const SliderLabel = styled.label`
  margin-right: 15px;
  font-size: 16px;
  color: #000;
  font-weight: bold;
  text-transform: uppercase;
  font-family: monospace;
  
  @media (max-width: 600px) {
    margin-bottom: 8px;
  }
`;

const StyledSlider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  height: 12px;
  background: #ddd;
  outline: none;
  margin: 0 10px;
  border: 2px solid #000;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: #000;
    cursor: pointer;
    border: 2px solid #000;
  }
  
  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    background: #000;
    cursor: pointer;
    border: 2px solid #000;
  }
  
  @media (max-width: 600px) {
    width: 100%;
    margin: 8px 0;
  }
`;

const CountValue = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: #000;
  min-width: 30px;
  text-align: center;
  font-family: monospace;
  border: 2px solid #000;
  padding: 2px 8px;
`;

const ColorCountSlider: React.FC<ColorCountSliderProps> = ({ 
  colorCount, 
  onChange,
  min = 1,
  max = 20
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onChange(value);
  };

  return (
    <SliderContainer>
      <SliderLabel>Number of Colors:</SliderLabel>
      <StyledSlider 
        type="range" 
        min={min} 
        max={max} 
        value={colorCount} 
        onChange={handleChange}
      />
      <CountValue>{colorCount}</CountValue>
    </SliderContainer>
  );
};

export default ColorCountSlider; 