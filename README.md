# PaletteGen

A brutalist-style web application for extracting color palettes from images. Upload any image and generate beautiful, harmonious color palettes for your design projects.

![PaletteGen Screenshot](screenshot.png)

## Features

- **Image Upload**: Upload your own images or use random images
- **Color Extraction**: Extract up to 16 colors from any image using K-means clustering algorithm
- **Color Formats**: View colors in HEX, RGB, or HSL formats
- **Copy Colors**: Click on any color to copy its value to your clipboard
- **Download Options**: Export palettes as PNG images or JSON files
- **Responsive Design**: Works on all device sizes
- **Brutalist UI**: High-contrast, bold interface with a raw aesthetic

## Technologies Used

- React
- TypeScript
- Styled Components
- HTML Canvas API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/palettegen.git
   cd palettegen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

1. Upload an image using the "Upload Image" button or click "Random Image"
2. Adjust the number of colors using the slider
3. Select your preferred color format (HEX, RGB, HSL)
4. Click on any color to see all available formats
5. Click on a color value to copy it to your clipboard
6. Download your palette as an image or JSON file

## Building for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## License

MIT License
