import { useState, useCallback } from 'react';
import { ArrowRight, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { Header } from '@/components/Header';
import { UploadZone } from '@/components/UploadZone';
import { WatchPreview } from '@/components/WatchPreview';
import { QRDisplay } from '@/components/QRDisplay';
import { StepIndicator } from '@/components/StepIndicator';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ElementList } from '@/components/ElementList';

import { useApp, actions } from '@/context/AppContext';
import { buildZPK } from '@/lib/zpkBuilder';
import { uploadZPKWithQR } from '@/lib/githubApi';
import { generateQRCode } from '@/lib/qrGenerator';
import type { WatchFaceConfig, WatchFaceElement, ElementImage } from '@/types';
import { generateId } from '@/lib/utils';

// Mock Kimi analysis - simulates AI analysis
async function mockKimiAnalysis(
  _backgroundImage: string,
  _fullDesignImage: string,
  watchModel: string
): Promise<{ config: WatchFaceConfig; elementImages: ElementImage[] }> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Parse watch model for resolution
  const resolutions: Record<string, { width: number; height: number }> = {
    // User's main goal
    'Balance 2': { width: 480, height: 480 },
    // Other requested models
    'Balance': { width: 480, height: 480 },
    'Active Max': { width: 480, height: 480 },
    'Active 3 Premium': { width: 466, height: 466 },
    'Active 2 Round': { width: 466, height: 466 },
    'Active 2 Square': { width: 390, height: 450 },
    'Active': { width: 390, height: 450 },
    'Pop 3S (PIB)': { width: 410, height: 502 },
    // Original models
    'GTR4': { width: 466, height: 466 },
    'GTS4': { width: 390, height: 450 },
    'Cheetah Pro': { width: 466, height: 466 },
    'T-Rex 2': { width: 454, height: 454 },
    'Falcon': { width: 416, height: 416 },
  };

  const resolution = resolutions[watchModel] || { width: 466, height: 466 };

  // Generate mock elements
  const elements: WatchFaceElement[] = [
    {
      id: generateId(),
      type: 'TIME_POINTER',
      subtype: 'hour',
      name: 'Hour Hand',
      bounds: { x: 220, y: 100, width: 40, height: 140 },
      center: { x: 240, y: 240 },
      color: '#1A1A1A',
      src: 'hour_hand.png',
      visible: true,
      zIndex: 10,
    },
    {
      id: generateId(),
      type: 'TIME_POINTER',
      subtype: 'minute',
      name: 'Minute Hand',
      bounds: { x: 230, y: 60, width: 20, height: 180 },
      center: { x: 240, y: 240 },
      color: '#333333',
      src: 'minute_hand.png',
      visible: true,
      zIndex: 11,
    },
    {
      id: generateId(),
      type: 'TIME_POINTER',
      subtype: 'second',
      name: 'Second Hand',
      bounds: { x: 235, y: 50, width: 10, height: 190 },
      center: { x: 240, y: 240 },
      color: '#FF6B35',
      src: 'second_hand.png',
      visible: true,
      zIndex: 12,
    },
    {
      id: generateId(),
      type: 'IMG_LEVEL',
      name: 'Battery Indicator',
      bounds: { x: 200, y: 400, width: 80, height: 20 },
      src: 'battery_icon.png',
      images: ['bat_0.png', 'bat_1.png', 'bat_2.png', 'bat_3.png', 'bat_4.png'],
      dataType: 'BATTERY',
      visible: true,
      zIndex: 5,
    },
    {
      id: generateId(),
      type: 'TEXT',
      name: 'Date Display',
      bounds: { x: 210, y: 280, width: 60, height: 24 },
      text: '12',
      fontSize: 20,
      color: '#FFFFFF',
      dataType: 'DATE',
      visible: true,
      zIndex: 5,
    },
  ];

  // Generate mock element images - create proper watch hand/element graphics
  console.log('[Mock] Starting element image generation for', elements.length, 'elements');
  const elementImages: ElementImage[] = [];
  
  elements
    .filter((el) => el.src)
    .forEach((el) => {
      console.log('[Mock] Creating canvas for element:', el.name, 'bounds:', el.bounds);
      
      // Create canvas with minimum size to ensure renderability
      const minSize = 200;  // Ensure minimum size for watch renderers
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(el.bounds.width || 100, minSize);
      canvas.height = Math.max(el.bounds.height || 100, minSize);
      
      if (canvas.width === 0 || canvas.height === 0) {
        console.error('[Mock] ERROR: Invalid canvas dimensions for', el.name);
      }
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw proper element graphics based on type
        if (el.type === 'TIME_POINTER') {
          // Draw watch hands with gradient
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, el.color || '#1A1A1A');
          gradient.addColorStop(1, adjustBrightness(el.color || '#1A1A1A', -30));
          ctx.fillStyle = gradient;
          
          // Draw hand shape (rectangle with rounded ends)
          const handWidth = Math.max(4, canvas.width * 0.15);
          const handX = (canvas.width - handWidth) / 2;
          ctx.beginPath();
          ctx.moveTo(handX, canvas.height * 0.3);
          ctx.lineTo(handX + handWidth, canvas.height * 0.3);
          ctx.lineTo(handX + handWidth, canvas.height * 0.9);
          ctx.quadraticCurveTo(handX + handWidth / 2, canvas.height * 0.95, handX, canvas.height * 0.9);
          ctx.closePath();
          ctx.fill();
          
          // Add highlight
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (el.type === 'IMG_LEVEL') {
          // Draw segmented level indicator
          ctx.fillStyle = el.color || '#FFD700';
          const segmentCount = 5;
          const segmentWidth = canvas.width / segmentCount;
          for (let i = 0; i < segmentCount; i++) {
            ctx.fillRect(segmentWidth * i + 2, canvas.height * 0.3, segmentWidth - 4, canvas.height * 0.4);
          }
        } else {
          // Generic colored element
          ctx.fillStyle = el.color || '#4ECDC4';
          ctx.fillRect(canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8);
          ctx.strokeStyle = adjustBrightness(el.color || '#4ECDC4', -50);
          ctx.lineWidth = 2;
          ctx.strokeRect(canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8);
        }
        
        console.log('[Mock] Canvas created for', el.name, 'size:', canvas.width, 'x', canvas.height);
      } else {
        console.error('[Mock] Failed to get 2D context for', el.name);
      }
      
      const dataUrl = canvas.toDataURL('image/png');
      console.log('[Mock] DataURL created, length:', dataUrl.length);
      
      if (!dataUrl || dataUrl.length < 100) {
        console.error('[Mock] ERROR: Invalid or empty dataURL for', el.name);
      }
      
      // Store the original filename and dataURL for later use
      const originalFilename = el.src!;
      elementImages.push({
        name: originalFilename,
        dataUrl,
        bounds: el.bounds,
        type: el.type,
      });
      
      // Update element to use dataURL for preview rendering
      el.src = dataUrl;
    });
  
  // Helper function to adjust color brightness
  function adjustBrightness(color: string, percent: number): string {
    const usePound = color[0] === "#";
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return (usePound ? "#" : "") + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }
  
  console.log('[Mock] Element images generated, total:', elementImages.length, 'images');

  const config: WatchFaceConfig = {
    name: `AI_WatchFace_${Date.now()}`,
    resolution,
    background: {
      src: 'bg.png',
      format: 'TGA-P',
    },
    elements,
    watchModel,
  };

  return { config, elementImages: elementImages };
}

function App() {
  const { state, dispatch } = useApp();
  const [watchModel, setWatchModel] = useState('Balance 2');
  const [watchFaceName, setWatchFaceName] = useState('');

  // Handle continue to analysis
  const handleAnalyze = useCallback(async () => {
    if (!state.backgroundImage || !state.fullDesignImage) {
      toast.error('Please upload both images');
      return;
    }

    dispatch(actions.setLoading(true));
    dispatch(actions.setLoadingMessage('Analyzing images with AI...'));
    dispatch(actions.setStep('analyzing'));

    try {
      // Call Kimi analysis (mock for now)
      const result = await mockKimiAnalysis(
        state.backgroundImage,
        state.fullDesignImage,
        watchModel
      );

      // Update state with results
      if (watchFaceName?.trim()) {
        result.config.name = watchFaceName.trim();
      }

      dispatch(actions.setWatchFaceConfig(result.config));
      dispatch(actions.setElementImages(result.elementImages));
      dispatch(actions.setStep('preview'));
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      dispatch(actions.setStep('upload'));
    } finally {
      dispatch(actions.setLoading(false));
    }
  }, [state.backgroundImage, state.fullDesignImage, watchModel, watchFaceName, dispatch]);

  // Handle generate ZPK
  const handleGenerate = useCallback(async () => {
    console.log('[App] handleGenerate called');
    
    if (!state.watchFaceConfig) {
      console.log('[App] ERROR: Missing watchFaceConfig');
      toast.error('Missing configuration');
      return;
    }
    
    if (!state.backgroundFile) {
      console.log('[App] ERROR: Missing backgroundFile');
      toast.error('Missing background file');
      return;
    }

    if (!state.githubToken) {
      console.log('[App] ERROR: Missing githubToken');
      toast.error('Please set your GitHub token in settings');
      return;
    }

    console.log('[App] All checks passed, starting generation...');
    console.log('[App] Background file:', state.backgroundFile.name, 'size:', state.backgroundFile.size);

    dispatch(actions.setLoading(true));
    dispatch(actions.setLoadingMessage('Generating ZPK file...'));
    dispatch(actions.setStep('generating'));

    try {
      // Build ZPK using File objects
      console.log('[App] Calling buildZPK...');
      
      // Convert elementImages from dataUrl to File objects
      const elementFiles = state.elementImages.map((img) => {
        console.log('[App] Converting element image to file:', img.name);
        
        // Parse data URL properly
        const parts = img.dataUrl.split(',');
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(parts[1]);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
          u8arr[i] = bstr.charCodeAt(i);
        }
        const blob = new Blob([u8arr], { type: mimeType });
        
        console.log('[App] Converted', img.name, 'size:', blob.size);
        return {
          src: img.name,
          file: new File([blob], img.name, { type: mimeType }),
        };
      });
      
      console.log('[App] Element files prepared:', { count: elementFiles.length, files: elementFiles.map(f => f.src) });
      
      if (elementFiles.length === 0) {
        console.warn('[App] WARNING: No element files were prepared!');
      }
      
      const zpkResult = await buildZPK({
        config: state.watchFaceConfig,
        backgroundFile: state.backgroundFile,
        elementFiles,
      });
      console.log('[App] ZPK built successfully, size:', zpkResult.size);

      dispatch(actions.setZpkBlob(zpkResult.blob));

      // Upload to GitHub with folder-based structure
      dispatch(actions.setLoadingMessage('Uploading to GitHub...'));

      const repoParts = state.githubRepo.split('/');
      const owner = repoParts[0];
      const repo = repoParts[1];
      
      console.log('[App] GitHub repo split:', { original: state.githubRepo, owner, repo, parts: repoParts });
      
      if (!owner || !repo || repoParts.length !== 2) {
        throw new Error(`Invalid GitHub repository format: "${state.githubRepo}". Expected format: "owner/repo"`);
      }

      // Step 1: Generate QR code with the expected GitHub Pages URL
      //  We use the watchface ID (timestamp-based) to create a predictable URL
      const watchfaceId = state.watchFaceConfig.name.replace(/\s+/g, '_');
      const expectedZpkUrl = `https://${owner}.github.io/${repo}/zpk/${watchfaceId}/face.zpk`;
      
      dispatch(actions.setLoadingMessage('Generating QR code...'));
      console.log('[App] Generating QR with expected URL:', expectedZpkUrl);
      const qrDataUrl = await generateQRCode(expectedZpkUrl);
      console.log('[App] QR code generated');

      // Step 2: Upload both ZPK and QR code to the same folder on GitHub
      console.log('[App] Starting folder-based upload (ZPK + QR)...');
      const uploadResult = await uploadZPKWithQR(
        {
          token: state.githubToken,
          owner,
          repo,
        },
        watchfaceId,
        zpkResult.blob,
        qrDataUrl,
        state.watchFaceConfig.name
      );

      if (!uploadResult.success) {
        console.error('[App] Upload error:', uploadResult.error);
        throw new Error(`GitHub upload failed: ${uploadResult.error || 'Unknown error'}`);
      }
      
      console.log('[App] Upload successful!');
      console.log('[App] ZPK URL:', uploadResult.downloadUrl);
      console.log('[App] QR URL:', uploadResult.qrUrl);

      dispatch(actions.setGithubUrl(uploadResult.downloadUrl || ''));
      dispatch(actions.setQrCode(qrDataUrl));

      dispatch(actions.setStep('success'));
      toast.success('Watch face created successfully!');
    } catch (error) {
      console.error('[App] Generation failed with error:', error);
      if (error instanceof Error) {
        console.error('[App] Error stack:', error.stack);
      }
      toast.error('Generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      dispatch(actions.setStep('preview'));
    } finally {
      dispatch(actions.setLoading(false));
    }
  }, [state.watchFaceConfig, state.backgroundFile, state.githubToken, state.githubRepo, dispatch]);

  // Handle reset
  const handleReset = useCallback(() => {
    dispatch(actions.reset());
    setWatchFaceName('');
    toast.info('Started new watch face');
  }, [dispatch]);

  // Toggle element visibility
  const handleToggleElement = useCallback(
    (id: string) => {
      if (!state.watchFaceConfig) return;

      const updatedElements = state.watchFaceConfig.elements.map((el) =>
        el.id === id ? { ...el, visible: !el.visible } : el
      );

      dispatch(
        actions.setWatchFaceConfig({
          ...state.watchFaceConfig,
          elements: updatedElements,
        })
      );
    },
    [state.watchFaceConfig, dispatch]
  );

  // Render different steps
  const renderContent = () => {
    switch (state.currentStep) {
      case 'upload':
        return (
          <div className="space-y-6">
            {/* Watch Model & Name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-zinc-300">Watch Model</Label>
                <select
                  value={watchModel}
                  onChange={(e) => setWatchModel(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-[#0F0F0F] border border-zinc-700 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                >
                  {/* User's requested models - Balance 2 as default */}
                  <option value="Balance 2">⭐ Amazfit Balance 2 (480×480)</option>
                  <option value="Balance">Amazfit Balance (480×480)</option>
                  <option value="Active Max">Amazfit Active Max (480×480)</option>
                  <option value="Active 3 Premium">Amazfit Active 3 Premium (466×466)</option>
                  <option value="Active 2 Round">Amazfit Active 2 Round (466×466)</option>
                  <option value="Active 2 Square">Amazfit Active 2 Square (390×450)</option>
                  <option value="Active">Amazfit Active (390×450)</option>
                  <option value="Pop 3S (PIB)">Amazfit Pop 3S / PIB (410×502)</option>
                  {/* Original models */}
                  <option value="GTR4">Amazfit GTR 4 (466×466)</option>
                  <option value="GTS4">Amazfit GTS 4 (390×450)</option>
                  <option value="Cheetah Pro">Amazfit Cheetah Pro (466×466)</option>
                  <option value="T-Rex 2">Amazfit T-Rex 2 (454×454)</option>
                  <option value="Falcon">Amazfit Falcon (416×416)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-zinc-300">Watch Face Name (optional)</Label>
                <Input
                  value={watchFaceName}
                  onChange={(e) => setWatchFaceName(e.target.value.trim())}
                  placeholder="My Custom Watch Face"
                  className="bg-[#0F0F0F] border-zinc-700 text-white placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Upload zones */}
            <div className="grid gap-4 sm:grid-cols-2">
              <UploadZone
                label="Background Image"
                sublabel="Clean 480×480 background"
                value={state.backgroundImage}
                onChange={(img) => dispatch(actions.setBackgroundImage(img))}
                onFileChange={(file) => dispatch(actions.setBackgroundFile(file))}
                expectedWidth={480}
                expectedHeight={480}
              />
              <UploadZone
                label="Full Design"
                sublabel="Complete design with elements"
                value={state.fullDesignImage}
                onChange={(img) => dispatch(actions.setFullDesignImage(img))}
                onFileChange={(file) => dispatch(actions.setFullDesignFile(file))}
              />
            </div>

            {/* Continue button */}
            <Button
              onClick={handleAnalyze}
              disabled={!state.backgroundImage || !state.fullDesignImage}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold disabled:opacity-50"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Analyze with AI
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        );

      case 'analyzing':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full border-4 border-zinc-800 border-t-cyan-500 animate-spin" />
              <Wand2 className="absolute inset-0 m-auto h-6 w-6 text-cyan-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Analyzing your design...</h3>
            <p className="text-zinc-500 text-center max-w-md">
              Our AI is detecting watch face elements, calculating positions, and preparing the configuration.
            </p>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            {state.backgroundImage && state.watchFaceConfig && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Watch preview */}
                <div className="flex flex-col items-center">
                  <h4 className="text-sm font-medium text-zinc-400 mb-4">Preview</h4>
                  <WatchPreview
                    backgroundImage={state.backgroundImage}
                    elements={state.watchFaceConfig.elements}
                    showBoundingBoxes={true}
                    className="w-full max-w-sm"
                  />
                </div>

                {/* Elements list */}
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-4">Detected Elements</h4>
                  <ElementList
                    elements={state.watchFaceConfig.elements}
                    onToggleVisibility={handleToggleElement}
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                onClick={handleGenerate}
                className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate ZPK & Upload
              </Button>
              <Button
                onClick={() => dispatch(actions.setStep('upload'))}
                variant="outline"
                className="h-12 border-zinc-700 text-white hover:bg-zinc-800"
              >
                Back
              </Button>
            </div>
          </div>
        );

      case 'generating':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full border-4 border-zinc-800 border-t-green-500 animate-spin" />
              <RefreshCw className="absolute inset-0 m-auto h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Building your watch face...</h3>
            <div className="w-full max-w-md mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Converting images to TGA format
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Generating JavaScript code
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                Packaging ZPK file
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <div className="h-2 w-2 rounded-full bg-zinc-700" />
                Uploading to GitHub
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6">
            {state.qrCodeDataUrl && state.githubUrl && (
              <QRDisplay
                qrCodeDataUrl={state.qrCodeDataUrl}
                githubUrl={state.githubUrl}
                zpkBlob={state.zpkBlob}
                filename={state.watchFaceConfig?.name + '.zpk'}
              />
            )}

            <Button
              onClick={handleReset}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Create Another Watch Face
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-6">
        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={state.currentStep} />
        </div>

        {/* Main content card */}
        <div className="bg-[#1A1A1A] rounded-2xl border border-zinc-800 p-6">
          {renderContent()}
        </div>

        {/* Tips */}
        {state.currentStep === 'upload' && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="p-4 bg-[#1A1A1A] rounded-xl border border-zinc-800">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="text-sm font-medium text-white mb-1">Design in Gemini</h4>
              <p className="text-xs text-zinc-500">
                Create your watch face design using Gemini AI with detailed prompts.
              </p>
            </div>
            <div className="p-4 bg-[#1A1A1A] rounded-xl border border-zinc-800">
              <div className="text-2xl mb-2">📤</div>
              <h4 className="text-sm font-medium text-white mb-1">Upload Images</h4>
              <p className="text-xs text-zinc-500">
                Upload clean background and full design images for AI analysis.
              </p>
            </div>
            <div className="p-4 bg-[#1A1A1A] rounded-xl border border-zinc-800">
              <div className="text-2xl mb-2">⌚</div>
              <h4 className="text-sm font-medium text-white mb-1">Install on Watch</h4>
              <p className="text-xs text-zinc-500">
                Scan the QR code with Zepp app to install your custom watch face.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Loading overlay */}
      <LoadingOverlay
        isVisible={state.isLoading}
        title={state.loadingMessage || 'Processing...'}
      />
    </div>
  );
}

export default App;
