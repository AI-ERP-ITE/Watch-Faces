export interface FontStyle {
  key: string;
  label: string;
  fontFamily: string;
  fontWeight: string;
  color: string;
}

export const FONT_STYLES: FontStyle[] = [
  { key: 'bold-white',       label: 'Bold White',       fontFamily: 'Arial',          fontWeight: 'bold',   color: '#FFFFFF' },
  { key: 'thin-cyan',        label: 'Thin Cyan',        fontFamily: 'Arial',          fontWeight: '300',    color: '#00D4FF' },
  { key: 'pixel-green',      label: 'Pixel Green',      fontFamily: 'Courier New',    fontWeight: 'bold',   color: '#00FF88' },
  { key: 'serif-gold',       label: 'Serif Gold',       fontFamily: 'Georgia',        fontWeight: 'bold',   color: '#FFD700' },
  { key: 'mono-red',         label: 'Mono Red',         fontFamily: 'Consolas',       fontWeight: 'normal', color: '#FF4444' },
  { key: 'rounded-blue',     label: 'Rounded Blue',     fontFamily: 'Verdana',        fontWeight: 'bold',   color: '#4A9EFF' },
  { key: 'condensed-silver', label: 'Condensed Silver', fontFamily: 'Arial Narrow',   fontWeight: 'bold',   color: '#C0C0C0' },
  { key: 'digital-green',    label: 'Digital Green',    fontFamily: 'Lucida Console', fontWeight: 'normal', color: '#33FF33' },
];

export function getFontStyle(key: string): FontStyle {
  return FONT_STYLES.find(f => f.key === key) ?? FONT_STYLES[0];
}

export function generateFontPreview(style: FontStyle): string {
  const w = 80, h = 28;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = style.color;
  ctx.font = `${style.fontWeight} ${Math.floor(h * 0.7)}px ${style.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('12:34', w / 2, h / 2);
  return canvas.toDataURL('image/png');
}
