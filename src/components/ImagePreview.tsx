import React from 'react';
import styled from 'styled-components';

interface ImagePreviewProps {
  imageUrl: string | null;
  loading: boolean;
}

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0;
  width: 100%;
  border: 3px solid #000;
  background-color: #eee;
  
  @media (min-width: 1024px) {
    min-height: 350px;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  overflow: hidden;
  background-color: #ddd;
`;

const StyledImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

const PlaceholderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #ddd;
  padding: 20px;
`;

const PlaceholderText = styled.p`
  font-size: 18px;
  color: #000;
  text-align: center;
  font-family: monospace;
  margin-top: 15px;
  text-transform: uppercase;
  font-weight: bold;
`;

const PlaceholderIcon = styled.div`
  font-size: 48px;
  color: #000;
`;

const PreviewInfo = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: monospace;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  border-bottom: 1px solid #000;
  padding-bottom: 5px;
  
  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-weight: bold;
  text-transform: uppercase;
`;

const Value = styled.span`
  font-family: monospace;
`;

// Simplified ImagePreview that doesn't show loading
const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl }) => {
  return (
    <PreviewContainer>
      <ImageContainer>
        {imageUrl ? (
          <StyledImage 
            src={imageUrl} 
            alt="Uploaded image" 
            key={imageUrl} // Add a key for better rendering control
          />
        ) : (
          <PlaceholderContainer>
            <PlaceholderIcon>🖼️</PlaceholderIcon>
            <PlaceholderText>
              Upload an image or select a random one
            </PlaceholderText>
          </PlaceholderContainer>
        )}
      </ImageContainer>
    </PreviewContainer>
  );
};

export default ImagePreview; 