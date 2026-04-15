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
  { key: 'roboto',           label: 'Roboto',           fontFamily: 'Roboto',         fontWeight: '700',    color: '#FFFFFF' },
  { key: 'roboto-mono',      label: 'Roboto Mono',      fontFamily: 'Roboto Mono',    fontWeight: '400',    color: '#E0E0E0' },
  { key: 'orbitron',         label: 'Orbitron',         fontFamily: 'Orbitron',       fontWeight: '700',    color: '#00D4FF' },
  { key: 'oswald',           label: 'Oswald',           fontFamily: 'Oswald',         fontWeight: '700',    color: '#FFFFFF' },
  { key: 'bebas',            label: 'Bebas Neue',       fontFamily: 'Bebas Neue',     fontWeight: '400',    color: '#FFD700' },
  { key: 'rajdhani',         label: 'Rajdhani',         fontFamily: 'Rajdhani',       fontWeight: '700',    color: '#00FF88' },
  { key: 'share-tech',       label: 'Share Tech',       fontFamily: 'Share Tech Mono', fontWeight: '400',   color: '#33FF33' },
  { key: 'goldman',          label: 'Goldman',          fontFamily: 'Goldman',        fontWeight: '700',    color: '#FF9F43' },
  { key: 'russo',            label: 'Russo One',        fontFamily: 'Russo One',      fontWeight: '400',    color: '#FFFFFF' },
  { key: 'audiowide',        label: 'Audiowide',        fontFamily: 'Audiowide',      fontWeight: '400',    color: '#4A9EFF' },
  { key: 'rationale',        label: 'Rationale',        fontFamily: 'Rationale',      fontWeight: '400',    color: '#C0C0C0' },
  { key: 'black-ops',        label: 'Black Ops One',    fontFamily: 'Black Ops One',  fontWeight: '400',    color: '#FF4444' },
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
