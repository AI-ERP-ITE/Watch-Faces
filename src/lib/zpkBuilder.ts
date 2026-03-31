// ZPK File Builder for ZeppOS Watch Faces
import JSZip from 'jszip';
import type { WatchFaceConfig } from '@/types';
import { generateWatchFaceCode } from './jsCodeGenerator';

export interface ZPKBuildOptions {
  config: WatchFaceConfig;
  backgroundFile: File;
  elementFiles: { src: string; file: File }[];
}

export interface ZPKBuildResult {
  blob: Blob;
  filename: string;
  size: number;
}

export async function buildZPK(options: ZPKBuildOptions): Promise<ZPKBuildResult> {
  console.log('[ZPK] Starting...');
  const { config, backgroundFile } = options;
  
  try {
    // Generate JavaScript code
    console.log('[ZPK] Step 1: Generating JS code...');
    const code = generateWatchFaceCode(config);
    console.log('[ZPK] Step 2: JS code generated, app.json length:', code.appJson.length);
    console.log('[ZPK] DEBUG: Generated app.json content:', code.appJson);
    
    // Create device.zip
    console.log('[ZPK] Step 3: Creating device.zip...');
    const deviceZip = new JSZip();
    
    console.log('[ZPK] Step 4: Adding app.json...');
    deviceZip.file('app.json', code.appJson);
    
    console.log('[ZPK] Step 5: Adding app.js...');
    deviceZip.file('app.js', code.appJs);
    
    console.log('[ZPK] Step 6: Adding watchface/index.js...');
    deviceZip.file('watchface/index.js', code.watchfaceIndexJs);
    
    // Add assets folder with images
    console.log('[ZPK] Step 7: Creating assets folder...');
    const assets = deviceZip.folder('assets');
    if (assets) {
      // Add background image
      console.log('[ZPK] Step 8: Adding background image...');
      assets.file('bg.png', backgroundFile);
      console.log('[ZPK] Step 9: Background image added, size:', backgroundFile.size);
      
      // Add element images
      console.log('[ZPK] Step 9b: Adding element images, count:', options.elementFiles.length);
      if (options.elementFiles.length === 0) {
        console.error('[ZPK] ERROR: No element files to add!');
      }
      
      for (const elementFile of options.elementFiles) {
        console.log('[ZPK] Adding element file:', elementFile.src, 'size:', elementFile.file.size);
        if (elementFile.file.size === 0) {
          console.error('[ZPK] ERROR: Element file is EMPTY:', elementFile.src);
        }
        assets.file(elementFile.src, elementFile.file);
      }
      console.log('[ZPK] Element images added, total:', options.elementFiles.length);
    } else {
      console.error('[ZPK] ERROR: Failed to create assets folder!');
    }
    
    console.log('[ZPK] Step 10: Generating device.zip blob (no compression)...');
    const deviceBlob = await deviceZip.generateAsync({ 
      type: 'blob',
      compression: 'STORE' // No compression to avoid memory issues
    });
    console.log('[ZPK] Step 11: device.zip generated, size:', deviceBlob.size);
    
    // Create app-side.zip - Matching working ZPK structure
    console.log('[ZPK] Step 12: Creating app-side.zip...');
    const appSideZip = new JSZip();
    const appSideJson = JSON.stringify({
      configVersion: 'v2',
      app: {
        appId: Math.floor(1000000 + Math.random() * 9000000),
        appName: config.name,
        appType: 'watchface',
        version: { code: 1, name: '1.0.0' },
        vender: 'AI-WatchFace-Creator',
        description: `Custom watch face - ${config.name}`,
        icon: 'bg.png',
      },
      permissions: [],
    }, null, 2);
    appSideZip.file('app.json', appSideJson);
    
    console.log('[ZPK] Step 13: Generating app-side.zip blob...');
    const appSideBlob = await appSideZip.generateAsync({ 
      type: 'blob',
      compression: 'STORE'
    });
    console.log('[ZPK] Step 14: app-side.zip generated, size:', appSideBlob.size);
    
    // Create final ZPK
    console.log('[ZPK] Step 15: Creating final ZPK...');
    const zpkZip = new JSZip();
    zpkZip.file('device.zip', deviceBlob);
    zpkZip.file('app-side.zip', appSideBlob);
    
    console.log('[ZPK] Step 16: Generating final ZPK blob...');
    const zpkBlob = await zpkZip.generateAsync({ 
      type: 'blob',
      compression: 'STORE'
    });
    console.log('[ZPK] Complete! Size:', zpkBlob.size);
    
    return {
      blob: zpkBlob,
      filename: `${config.name.replace(/\s+/g, '_')}.zpk`,
      size: zpkBlob.size,
    };
  } catch (error) {
    console.error('[ZPK] Error in buildZPK:', error);
    throw error;
  }
}
