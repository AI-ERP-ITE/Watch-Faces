// QR Code Generator for ZeppOS Watch Face Installation

import QRCode from 'qrcode';

// Generate QR code for ZPK installation
export async function generateQRCode(zpkUrl: string): Promise<string> {
  // ZeppOS uses zpkd1:// protocol for watch face installation
  const zpkd1Url = `zpkd1://${zpkUrl}`;
  
  try {
    const dataUrl = await QRCode.toDataURL(zpkd1Url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
    
    return dataUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Generate QR code with custom options
export async function generateQRCodeCustom(
  zpkUrl: string,
  options: {
    width?: number;
    darkColor?: string;
    lightColor?: string;
  } = {}
): Promise<string> {
  const { width = 400, darkColor = '#000000', lightColor = '#FFFFFF' } = options;
  const zpkd1Url = `zpkd1://${zpkUrl}`;
  
  try {
    const dataUrl = await QRCode.toDataURL(zpkd1Url, {
      width,
      margin: 2,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: 'H',
    });
    
    return dataUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Download QR code as image
export function downloadQRCode(dataUrl: string, filename: string = 'watchface-qr.png') {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
