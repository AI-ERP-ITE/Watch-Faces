import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { WatchFaceElement } from '@/types';

const CANVAS_SIZE = 480;
const CX = 240;
const CY = 240;

// Mock time: 10:10:30 — visually balanced, classic watchface demo pose
const MOCK_HOUR = 10;
const MOCK_MINUTE = 10;
const MOCK_SECOND = 30;

interface CanvasWatchPreviewProps {
  backgroundImage?: string;
  elements: WatchFaceElement[];
  className?: string;
}

export function CanvasWatchPreview({
  backgroundImage,
  elements,
  className,
}: CanvasWatchPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If we have a background image, load it first then draw elements on top
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        drawBackground(ctx, img);
        drawElements(ctx, elements);
      };
      img.src = backgroundImage;
    } else {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drawBlackCircle(ctx);
      drawElements(ctx, elements);
    }
  }, [backgroundImage, elements]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className={cn('rounded-full shadow-2xl', className)}
      style={{
        maxWidth: '100%',
        height: 'auto',
        boxShadow: '0 0 60px rgba(0, 212, 255, 0.15), inset 0 0 30px rgba(0, 0, 0, 0.5)',
      }}
    />
  );
}

// ─── Background ─────────────────────────────────────────────────────────────────

function drawBlackCircle(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(CX, CY, CX, 0, Math.PI * 2);
  ctx.fillStyle = '#111111';
  ctx.fill();
  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  // Clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(CX, CY, CX, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.restore();
}

// ─── Element Dispatcher ─────────────────────────────────────────────────────────

function drawElements(ctx: CanvasRenderingContext2D, elements: WatchFaceElement[]) {
  // Sort by zIndex for correct layering
  const sorted = [...elements].filter(e => e.visible).sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sorted) {
    switch (el.type) {
      case 'ARC_PROGRESS':
        drawArc(ctx, el);
        break;
      case 'TIME_POINTER':
        drawTimePointer(ctx, el);
        break;
      default:
        // IMG_TIME, IMG_DATE, IMG_WEEK, TEXT, TEXT_IMG, IMG, IMG_STATUS, IMG_LEVEL
        drawPlaceholder(ctx, el);
        break;
    }
  }
}

// ─── ARC_PROGRESS ───────────────────────────────────────────────────────────────

function drawArc(ctx: CanvasRenderingContext2D, el: WatchFaceElement) {
  const cx = el.center?.x ?? CX;
  const cy = el.center?.y ?? CY;
  const radius = el.radius ?? 100;
  const startDeg = el.startAngle ?? 135;
  const endDeg = el.endAngle ?? 345;
  const lineWidth = el.lineWidth ?? 8;
  const color = parseZeppColor(el.color ?? '0x00FF00');

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, degToRad(startDeg), degToRad(endDeg));
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Draw data type label at arc midpoint
  if (el.dataType) {
    const midDeg = (startDeg + endDeg) / 2;
    const labelR = radius + 16;
    const lx = cx + labelR * Math.cos(degToRad(midDeg));
    const ly = cy + labelR * Math.sin(degToRad(midDeg));

    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(el.dataType, lx, ly);
  }
  ctx.restore();
}

// ─── TIME_POINTER ───────────────────────────────────────────────────────────────

function drawTimePointer(ctx: CanvasRenderingContext2D, el: WatchFaceElement) {
  const cx = el.pointerCenter?.x ?? el.center?.x ?? CX;
  const cy = el.pointerCenter?.y ?? el.center?.y ?? CY;

  // Angular positions for mock time 10:10:30
  const hourAngle = ((MOCK_HOUR % 12) + MOCK_MINUTE / 60) * 30 - 90;   // degrees
  const minuteAngle = MOCK_MINUTE * 6 - 90;
  const secondAngle = MOCK_SECOND * 6 - 90;

  // Hand lengths (proportional to real hardware assets)
  drawHand(ctx, cx, cy, 65, 10, hourAngle, '#CCCCCC');    // hour: short + thick
  drawHand(ctx, cx, cy, 95, 7, minuteAngle, '#FFFFFF');    // minute: long + medium
  drawHand(ctx, cx, cy, 115, 2, secondAngle, '#FF4444');   // second: longest + thin

  // Center cap
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();
}

function drawHand(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  length: number, width: number,
  angleDeg: number,
  color: string,
) {
  const rad = degToRad(angleDeg);
  const tipX = cx + length * Math.cos(rad);
  const tipY = cy + length * Math.sin(rad);
  const tailX = cx - (length * 0.2) * Math.cos(rad);
  const tailY = cy - (length * 0.2) * Math.sin(rad);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(tipX, tipY);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

// ─── Placeholder (rectangles for IMG_TIME, TEXT, etc.) ──────────────────────────

function drawPlaceholder(ctx: CanvasRenderingContext2D, el: WatchFaceElement) {
  const { x, y, width, height } = el.bounds;

  ctx.save();

  // Semi-transparent box
  ctx.fillStyle = 'rgba(0, 200, 255, 0.08)';
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);

  // Label
  const label = formatLabel(el);
  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(0, 200, 255, 0.7)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + width / 2, y + height / 2, width - 4);

  ctx.restore();
}

function formatLabel(el: WatchFaceElement): string {
  // Show meaningful label based on widget name
  const name = el.name.toLowerCase();
  if (name.includes('time')) return '10:10';
  if (name.includes('date')) return '08';
  if (name.includes('month')) return 'APR';
  if (name.includes('week')) return 'TUE';
  if (name.includes('weather')) return '☀ 24°';
  if (el.dataType) return el.dataType;
  return el.name;
}

// ─── Utilities ──────────────────────────────────────────────────────────────────

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert Zepp hex color '0xRRGGBB' to CSS '#RRGGBB' */
function parseZeppColor(zeppHex: string): string {
  if (zeppHex.startsWith('0x') || zeppHex.startsWith('0X')) {
    return '#' + zeppHex.slice(2).padStart(6, '0');
  }
  return zeppHex;
}
