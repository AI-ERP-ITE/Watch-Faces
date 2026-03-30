// TGA Image Converter for ZeppOS
// Converts PNG/JPEG images to TGA format variants

export type TGAFormat = 'TGA-P' | 'TGA-RLP' | 'TGA-16' | 'TGA-32';

interface TGAOptions {
  format: TGAFormat;
  width: number;
  height: number;
}

// Load image from data URL
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// Convert data URL to TGA format
export async function convertToTGA(
  dataUrl: string,
  options: TGAOptions
): Promise<Uint8Array> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Draw image to canvas
  ctx.drawImage(img, 0, 0, options.width, options.height);
  const imageData = ctx.getImageData(0, 0, options.width, options.height);

  // Always use TGA-32 for simplicity and reliability
  return convertToTGA32(imageData);
}

// TGA-32: 32-bit RGBA (full color with alpha) - Most compatible
function convertToTGA32(imageData: ImageData): Uint8Array {
  const { width, height, data } = imageData;
  
  // Standard TGA header (18 bytes)
  const header = new Uint8Array(18);
  header[0] = 0; // ID length
  header[1] = 0; // Color map type (0 = no palette)
  header[2] = 2; // Image type (2 = uncompressed true-color)
  
  const view = new DataView(header.buffer);
  view.setUint16(12, width, true);  // Width
  view.setUint16(14, height, true); // Height
  header[16] = 32; // Pixel depth (32 bits)
  header[17] = 8;  // Image descriptor (8 bits alpha + origin)

  // Pixel data in BGRA order (TGA format)
  const pixelData = new Uint8Array(width * height * 4);
  let pixelIndex = 0;
  
  // Process pixels in reverse row order (TGA stores bottom-to-top by default)
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      // BGRA order for TGA
      pixelData[pixelIndex++] = data[i + 2]; // B
      pixelData[pixelIndex++] = data[i + 1]; // G
      pixelData[pixelIndex++] = data[i];     // R
      pixelData[pixelIndex++] = data[i + 3]; // A
    }
  }

  // Combine header + pixel data
  const tgaData = new Uint8Array(18 + pixelData.length);
  tgaData.set(header, 0);
  tgaData.set(pixelData, 18);

  return tgaData;
}

// Determine best TGA format for image type
export function getBestTGAFormat(_imageType: string): TGAFormat {
  // Always use TGA-32 for maximum compatibility
  return 'TGA-32';
}
