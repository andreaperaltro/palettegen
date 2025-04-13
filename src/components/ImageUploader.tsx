import React, { useRef } from 'react';
import styled from 'styled-components';

interface ImageUploaderProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRandomImage: () => Promise<void>;
  loading: boolean;
}

const UploaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 20px 0;
  gap: 15px;
  background-color: #ddd;
  padding: 20px;
  border: 3px solid #000;
  
  @media (min-width: 600px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const UploadButton = styled.button`
  background-color: #000;
  color: white;
  border: 3px solid #000;
  border-radius: 0;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover {
    background-color: white;
    color: #000;
  }
  
  &:active {
    transform: translateY(4px);
  }
  
  &:disabled {
    background-color: #999;
    border-color: #999;
    color: #ccc;
    cursor: not-allowed;
  }
  
  @media (max-width: 600px) {
    width: 100%;
  }
`;

const RandomButton = styled(UploadButton)`
  background-color: #fff;
  color: #000;
  border: 3px solid #000;
  
  &:hover {
    background-color: #000;
    color: #fff;
  }
  
  &:disabled {
    background-color: #ccc;
    border-color: #999;
    color: #999;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

// Use React.memo to prevent unnecessary re-renders
const ImageUploader: React.FC<ImageUploaderProps> = React.memo(({
  onImageUpload,
  onRandomImage,
  loading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Clear the file input to allow selecting the same file again
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImageUpload(e);
    // Reset the input value after selecting a file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <UploaderContainer>
      <UploadButton 
        onClick={handleUploadClick}
        disabled={loading}
        type="button"
      >
        {loading ? 'Processing...' : 'Upload Image'}
      </UploadButton>
      
      <HiddenFileInput
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/*"
      />
      
      <RandomButton
        onClick={onRandomImage}
        disabled={loading}
        type="button"
      >
        {loading ? 'Fetching...' : 'Random Image'}
      </RandomButton>
    </UploaderContainer>
  );
});

export default ImageUploader; 