export interface IconEntry {
  key: string;
  label: string;
  dataUrl: string;
  width: number;
  height: number;
}

function drawIcon(draw: (ctx: CanvasRenderingContext2D, s: number) => void): string {
  const s = 48;
  const canvas = document.createElement('canvas');
  canvas.width = s; canvas.height = s;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, s, s);
  draw(ctx, s);
  return canvas.toDataURL('image/png');
}

function makeBattery(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.strokeStyle = '#44ff88'; ctx.lineWidth = 2.5; ctx.fillStyle = '#44ff88';
  ctx.beginPath(); ctx.roundRect(4, 12, 34, 24, 3); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(38, 18, 6, 12, 2); ctx.fill();
  ctx.fillRect(7, 15, 20, 18);
}

function makeHeart(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = '#ff4466';
  ctx.beginPath();
  const x = s / 2, y = s / 2 + 2;
  ctx.moveTo(x, y + 10);
  ctx.bezierCurveTo(x - 18, y, x - 18, y - 14, x, y - 8);
  ctx.bezierCurveTo(x + 18, y - 14, x + 18, y, x, y + 10);
  ctx.fill();
}

function makeSteps(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.fillStyle = '#ff9933';
  // Left foot
  ctx.beginPath(); ctx.ellipse(12, 30, 7, 10, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(6, 20, 10, 6, 2); ctx.fill();
  // Right foot offset
  ctx.fillStyle = '#ffbb55';
  ctx.beginPath(); ctx.ellipse(30, 22, 7, 10, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(26, 12, 10, 6, 2); ctx.fill();
}

function makeCalories(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.fillStyle = '#ff6600';
  ctx.beginPath();
  ctx.moveTo(24, 4);
  ctx.bezierCurveTo(32, 14, 38, 22, 36, 30);
  ctx.bezierCurveTo(34, 38, 28, 44, 24, 44);
  ctx.bezierCurveTo(20, 44, 14, 38, 12, 30);
  ctx.bezierCurveTo(10, 22, 16, 14, 24, 4);
  ctx.fill();
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.moveTo(24, 16);
  ctx.bezierCurveTo(28, 22, 30, 28, 28, 33);
  ctx.bezierCurveTo(26, 37, 24, 38, 22, 35);
  ctx.bezierCurveTo(18, 30, 20, 22, 24, 16);
  ctx.fill();
}

function makeSpo2(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = '#00ccff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('O', s / 2 - 5, s / 2);
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('₂', s / 2 + 9, s / 2 + 4);
  ctx.strokeStyle = '#00ccff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(s / 2, s / 2, s / 2 - 4, 0, Math.PI * 2); ctx.stroke();
}

function makeDistance(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.fillStyle = '#3399ff';
  ctx.beginPath();
  ctx.arc(24, 18, 10, Math.PI, 0);
  ctx.lineTo(34, 18);
  ctx.lineTo(24, 38);
  ctx.lineTo(14, 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#001133';
  ctx.beginPath(); ctx.arc(24, 18, 5, 0, Math.PI * 2); ctx.fill();
}

function makeStress(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.strokeStyle = '#aa44ff'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(4, 30);
  ctx.lineTo(12, 18);
  ctx.lineTo(18, 26);
  ctx.lineTo(24, 10);
  ctx.lineTo(30, 22);
  ctx.lineTo(36, 16);
  ctx.lineTo(44, 28);
  ctx.stroke();
}

function makeSleep(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.fillStyle = '#7766ff';
  ctx.beginPath();
  ctx.arc(24, 24, 16, Math.PI * 0.8, Math.PI * 2.2);
  ctx.arc(18, 18, 10, Math.PI * 1.5, Math.PI * 0.5, true);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#aaaaff';
  ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('z', 36, 14);
  ctx.font = 'bold 8px sans-serif';
  ctx.fillText('z', 40, 8);
}

function makeAlarm(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.fillStyle = '#ffdd00';
  ctx.beginPath();
  ctx.arc(24, 24, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath(); ctx.arc(24, 24, 4, 0, Math.PI * 2); ctx.fill();
  // Bell handle
  ctx.strokeStyle = '#ffdd00'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(24, 12, 5, Math.PI, 0); ctx.stroke();
  // Ringer dots
  ctx.fillStyle = '#ffdd00';
  ctx.beginPath(); ctx.arc(10, 24, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(38, 24, 3, 0, Math.PI * 2); ctx.fill();
}

function makeBluetooth(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.strokeStyle = '#4499ff'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(16, 34); ctx.lineTo(32, 14); ctx.lineTo(24, 8);
  ctx.lineTo(24, 40); ctx.lineTo(32, 34); ctx.lineTo(16, 14);
  ctx.stroke();
}

function makeWeatherSun(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.fillStyle = '#ffdd00';
  ctx.beginPath(); ctx.arc(24, 24, 10, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffdd00'; ctx.lineWidth = 2.5;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(24 + Math.cos(a) * 14, 24 + Math.sin(a) * 14);
    ctx.lineTo(24 + Math.cos(a) * 20, 24 + Math.sin(a) * 20);
    ctx.stroke();
  }
}

function makeWeatherCloud(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.fillStyle = '#aabbcc';
  ctx.beginPath();
  ctx.arc(18, 26, 10, 0, Math.PI * 2);
  ctx.arc(28, 22, 12, 0, Math.PI * 2);
  ctx.arc(36, 28, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#aabbcc';
  ctx.fillRect(10, 26, 34, 12);
}

function makeNotification(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.fillStyle = '#ff4444';
  ctx.beginPath(); ctx.arc(36, 12, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ccccff';
  ctx.strokeStyle = '#ccccff'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(10, 40); ctx.lineTo(12, 14); ctx.arc(24, 14, 12, Math.PI, 0);
  ctx.lineTo(38, 40); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#888899';
  ctx.beginPath(); ctx.arc(24, 43, 4, 0, Math.PI * 2); ctx.fill();
}

function makeMoon(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.fillStyle = '#ccddff';
  ctx.beginPath();
  ctx.arc(24, 24, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111122';
  ctx.beginPath();
  ctx.arc(30, 20, 14, 0, Math.PI * 2); ctx.fill();
}

function makePai(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.fillStyle = '#ff3355';
  ctx.beginPath(); ctx.arc(24, 24, 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('P', 24, 25);
}

function makeStand(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.fillStyle = '#44cc66';
  ctx.beginPath(); ctx.arc(24, 10, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(24, 16); ctx.lineTo(20, 28); ctx.lineTo(16, 44);
  ctx.lineTo(20, 44); ctx.lineTo(24, 34); ctx.lineTo(28, 44);
  ctx.lineTo(32, 44); ctx.lineTo(28, 28); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(24, 20); ctx.lineTo(14, 28); ctx.lineTo(34, 28); ctx.closePath(); ctx.fill();
}

function makeFatBurn(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.fillStyle = '#ff7700';
  ctx.beginPath();
  ctx.moveTo(24, 4);
  ctx.bezierCurveTo(30, 12, 34, 18, 32, 26);
  ctx.bezierCurveTo(30, 32, 26, 36, 24, 36);
  ctx.bezierCurveTo(22, 36, 18, 32, 16, 26);
  ctx.bezierCurveTo(14, 18, 18, 12, 24, 4);
  ctx.fill();
  ctx.fillStyle = '#44aaff';
  ctx.beginPath(); ctx.arc(28, 38, 6, 0, Math.PI * 2); ctx.fill();
}

function makeUvi(ctx: CanvasRenderingContext2D, s: number) {
  ctx.fillStyle = '#ffee00';
  ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('UV', s / 2, s / 2 - 4);
  ctx.strokeStyle = '#ffee00'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(8, 34); ctx.lineTo(40, 34); ctx.stroke();
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('index', s / 2, s / 2 + 12);
}

function makeAqi(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.fillStyle = '#44cc44';
  ctx.beginPath();
  ctx.moveTo(24, 6);
  ctx.bezierCurveTo(36, 6, 42, 18, 40, 28);
  ctx.bezierCurveTo(38, 38, 30, 44, 24, 44);
  ctx.bezierCurveTo(18, 44, 10, 38, 8, 28);
  ctx.bezierCurveTo(6, 18, 12, 6, 24, 6);
  ctx.fill();
  ctx.strokeStyle = '#006600'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(24, 12); ctx.lineTo(24, 38); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(24, 12); ctx.bezierCurveTo(30, 18, 30, 26, 24, 28); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(24, 22); ctx.bezierCurveTo(18, 28, 18, 34, 24, 38); ctx.stroke();
}

function makeHumidity(ctx: CanvasRenderingContext2D, _s: number) {
  ctx.fillStyle = '#3388ff';
  ctx.beginPath();
  ctx.moveTo(24, 6);
  ctx.bezierCurveTo(34, 18, 40, 28, 38, 34);
  ctx.bezierCurveTo(36, 42, 28, 46, 24, 44);
  ctx.bezierCurveTo(20, 46, 12, 42, 10, 34);
  ctx.bezierCurveTo(8, 28, 14, 18, 24, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.ellipse(19, 28, 4, 7, -0.5, 0, Math.PI * 2); ctx.fill();
}

const ICON_DEFS: Array<{ key: string; label: string; draw: (ctx: CanvasRenderingContext2D, s: number) => void }> = [
  { key: 'battery',       label: 'Battery',          draw: makeBattery },
  { key: 'heart',         label: 'Heart Rate',        draw: makeHeart },
  { key: 'steps',         label: 'Steps',             draw: makeSteps },
  { key: 'calories',      label: 'Calories',          draw: makeCalories },
  { key: 'spo2',          label: 'SpO2',              draw: makeSpo2 },
  { key: 'distance',      label: 'Distance',          draw: makeDistance },
  { key: 'stress',        label: 'Stress',            draw: makeStress },
  { key: 'sleep',         label: 'Sleep',             draw: makeSleep },
  { key: 'alarm',         label: 'Alarm',             draw: makeAlarm },
  { key: 'bluetooth',     label: 'Bluetooth',         draw: makeBluetooth },
  { key: 'weather_sun',   label: 'Weather: Sun',      draw: makeWeatherSun },
  { key: 'weather_cloud', label: 'Weather: Cloud',    draw: makeWeatherCloud },
  { key: 'notification',  label: 'Notification',      draw: makeNotification },
  { key: 'moon',          label: 'Moon Phase',        draw: makeMoon },
  { key: 'pai',           label: 'PAI',               draw: makePai },
  { key: 'stand',         label: 'Stand',             draw: makeStand },
  { key: 'fat_burn',      label: 'Fat Burn',          draw: makeFatBurn },
  { key: 'uvi',           label: 'UV Index',          draw: makeUvi },
  { key: 'aqi',           label: 'Air Quality',       draw: makeAqi },
  { key: 'humidity',      label: 'Humidity',          draw: makeHumidity },
];

export const ICON_KEYS = ICON_DEFS.map(d => d.key);

function generateAllIcons(): IconEntry[] {
  return ICON_DEFS.map(def => ({
    key: def.key,
    label: def.label,
    dataUrl: drawIcon(def.draw),
    width: 48,
    height: 48,
  }));
}

let _cache: IconEntry[] | null = null;

export function getIconLibrary(): IconEntry[] {
  if (!_cache) _cache = generateAllIcons();
  return _cache;
}

export function getIconByKey(key: string): IconEntry | undefined {
  return getIconLibrary().find(i => i.key === key);
}
