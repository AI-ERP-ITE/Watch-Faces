import { Download, Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, downloadBlob } from '@/lib/utils';
import { downloadQRCode } from '@/lib/qrGenerator';
import { toast } from 'sonner';

interface QRDisplayProps {
  qrCodeDataUrl: string;
  githubUrl: string;
  zpkBlob?: Blob | null;
  filename?: string;
  className?: string;
}

export function QRDisplay({
  qrCodeDataUrl,
  githubUrl,
  zpkBlob,
  filename = 'watchface.zpk',
  className,
}: QRDisplayProps) {
  const handleDownloadQR = () => {
    try {
      console.log('[QRDisplay] Starting QR code download');
      downloadQRCode(qrCodeDataUrl, filename.replace('.zpk', '-qr.png'));
      toast.success('QR code saved successfully!');
    } catch (error) {
      console.error('[QRDisplay] QR download error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to download QR code: ${message}`);
    }
  };

  const handleDownloadZPK = () => {
    try {
      if (!zpkBlob) {
        throw new Error('ZPK file is not available');
      }
      console.log('[QRDisplay] Starting ZPK download', { filename, size: zpkBlob.size });
      downloadBlob(zpkBlob, filename);
      toast.success('Watch face saved successfully!');
    } catch (error) {
      console.error('[QRDisplay] ZPK download error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to download watch face: ${message}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Custom Watch Face',
          text: 'Check out this custom watch face I created!',
          url: githubUrl,
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(githubUrl);
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Success indicator */}
      <div className="flex items-center gap-2 text-green-500">
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Watch face created successfully!</span>
      </div>

      {/* QR Code */}
      <div className="relative">
        <div
          className="p-4 bg-white rounded-2xl shadow-xl"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          <img
            src={qrCodeDataUrl}
            alt="QR Code for watch face installation"
            className="w-64 h-64"
          />
        </div>
        
        {/* Decorative ring */}
        <div
          className="absolute -inset-3 rounded-3xl border-2 border-cyan-500/20 pointer-events-none"
        />
      </div>

      {/* Instructions */}
      <div className="text-center space-y-1">
        <p className="text-white font-medium">Scan with Zepp app</p>
        <p className="text-zinc-500 text-sm">
          Open Zepp app → Profile → My Devices → Watch Faces → Scan QR
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={handleDownloadQR}
          variant="outline"
          className="border-zinc-700 text-white hover:bg-zinc-800 hover:border-cyan-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Save QR
        </Button>
        
        {zpkBlob && (
          <Button
            onClick={handleDownloadZPK}
            variant="outline"
            className="border-zinc-700 text-white hover:bg-zinc-800 hover:border-cyan-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Download ZPK
          </Button>
        )}
        
        <Button
          onClick={handleShare}
          variant="outline"
          className="border-zinc-700 text-white hover:bg-zinc-800 hover:border-cyan-500"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* URL display */}
      <div className="w-full max-w-md">
        <p className="text-xs text-zinc-500 mb-1.5">Installation URL</p>
        <div className="flex items-center gap-2 p-3 bg-[#1A1A1A] rounded-lg border border-zinc-800">
          <code className="flex-1 text-xs text-zinc-400 truncate">
            {githubUrl}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(githubUrl)}
            className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
