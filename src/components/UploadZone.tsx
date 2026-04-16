import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn, fileToObjectUrl } from '@/lib/utils';

interface UploadZoneProps {
  label: string;
  sublabel: string;
  value: string | null;
  onChange?: (objectUrl: string | null) => void;
  onFileChange?: (file: File | null) => void;
  expectedWidth?: number;
  expectedHeight?: number;
  className?: string;
}

export function UploadZone({
  label,
  sublabel,
  value,
  onChange,
  onFileChange,
  expectedWidth,
  expectedHeight,
  className,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        return;
      }

      try {
        // Use object URL instead of data URL (much more efficient for large images)
        const objectUrl = fileToObjectUrl(file);
        onChange?.(objectUrl);
        onFileChange?.(file);

        // Get image dimensions
        const img = new Image();
        img.onload = () => {
          setDimensions({ width: img.width, height: img.height });
        };
        img.src = objectUrl;
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    },
    [onChange, onFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    // Revoke object URL to free memory
    if (value) {
      URL.revokeObjectURL(value);
    }
    onChange?.(null);
    onFileChange?.(null);
    setDimensions(null);
  }, [onChange, onFileChange, value]);

  const showDimensionWarning =
    dimensions &&
    expectedWidth &&
    expectedHeight &&
    (dimensions.width !== expectedWidth || dimensions.height !== expectedHeight);

  if (value) {
    return (
      <div className={cn('relative group', className)}>
        <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-700 bg-[#1A1A1A]">
          <img
            src={value}
            alt={label}
            className="h-full w-full object-contain"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
              <span className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white transition-colors">
                Replace
              </span>
            </label>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-sm text-white transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">{label}</p>
            {dimensions && (
              <p className="text-xs text-zinc-500">
                {dimensions.width} × {dimensions.height}px
              </p>
            )}
          </div>
          {showDimensionWarning && (
            <span className="text-xs text-amber-500">
              Expected {expectedWidth}×{expectedHeight}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <label
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-all cursor-pointer',
        isDragging
          ? 'border-cyan-500 bg-cyan-500/5 scale-[1.02]'
          : 'border-zinc-700 bg-[#1A1A1A] hover:border-zinc-600 hover:bg-zinc-800/50',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
        {isDragging ? (
          <ImageIcon className="h-6 w-6 text-cyan-500" />
        ) : (
          <Upload className="h-6 w-6 text-zinc-400" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{sublabel}</p>
        {expectedWidth && expectedHeight && (
          <p className="text-xs text-zinc-600 mt-1">
            Recommended: {expectedWidth}×{expectedHeight}px
          </p>
        )}
      </div>
    </label>
  );
}
