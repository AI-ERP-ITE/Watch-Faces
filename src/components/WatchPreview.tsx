import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { WatchFaceElement } from '@/types';

interface WatchPreviewProps {
  backgroundImage: string;
  elements: WatchFaceElement[];
  className?: string;
  showBoundingBoxes?: boolean;
  onElementClick?: (element: WatchFaceElement) => void;
}

export function WatchPreview({
  backgroundImage,
  elements,
  className,
  showBoundingBoxes = false,
  onElementClick,
}: WatchPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Calculate scale to fit container
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerSize = Math.min(container.clientWidth, container.clientHeight);
      setScale(containerSize / 480);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        className
      )}
    >
      {/* Watch face container */}
      <div
        className="relative rounded-full overflow-hidden shadow-2xl"
        style={{
          width: 480 * scale,
          height: 480 * scale,
          boxShadow: '0 0 60px rgba(0, 212, 255, 0.15), inset 0 0 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Background image */}
        <img
          src={backgroundImage}
          alt="Watch face background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Elements overlay */}
        {elements
          .filter((el) => el.visible)
          .map((element) => (
            <div
              key={element.id}
              className={cn(
                'absolute cursor-pointer transition-all',
                showBoundingBoxes && 'ring-2 ring-cyan-500/50 hover:ring-cyan-400'
              )}
              style={{
                left: element.bounds.x * scale,
                top: element.bounds.y * scale,
                width: element.bounds.width * scale,
                height: element.bounds.height * scale,
                zIndex: element.zIndex,
              }}
              onClick={() => onElementClick?.(element)}
            >
              {element.src && (
                <img
                  src={element.src}
                  alt={element.name}
                  className="w-full h-full object-contain"
                  style={{
                    transformOrigin: `${(element.center?.x || 0) - element.bounds.x}px ${(element.center?.y || 0) - element.bounds.y}px`,
                  }}
                />
              )}
              {showBoundingBoxes && (
                <div className="absolute -top-5 left-0 bg-cyan-500 text-black text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                  {element.name}
                </div>
              )}
            </div>
          ))}

        {/* Watch bezel overlay */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)',
            border: '3px solid rgba(255, 255, 255, 0.1)',
          }}
        />
      </div>
    </div>
  );
}
