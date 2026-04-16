import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { WatchFaceElement } from '@/types';
import { getIconLibrary } from '@/lib/iconLibrary';
import { cn } from '@/lib/utils';
import { FONT_STYLES, getFontStyle } from '@/lib/fontLibrary';

export interface PropertyPanelProps {
  element: WatchFaceElement | null;
  onUpdateElement?: (id: string, changes: Partial<WatchFaceElement>) => void;
  className?: string;
}

const WIDGET_TYPES: WatchFaceElement['type'][] = [
  'ARC_PROGRESS', 'TIME_POINTER', 'TEXT_IMG', 'IMG', 'TEXT',
  'IMG_LEVEL', 'IMG_STATUS', 'CIRCLE', 'BUTTON',
];

const DATA_TYPES = [
  'BATTERY', 'STEP', 'HEART', 'SPO2', 'CAL', 'DISTANCE',
  'STRESS', 'PAI', 'SLEEP', 'STAND', 'FAT_BURN',
  'UVI', 'AQI', 'HUMIDITY', 'SUN_RISE', 'SUN_SET',
  'WIND', 'ALARM', 'NOTIFICATION', 'MOON',
  'WEATHER_CURRENT',
];

const APP_SHORTCUTS = [
  { value: '', label: '— none —' },
  { value: 'HeartRate', label: 'Heart Rate' },
  { value: 'Sport', label: 'Exercise' },
  { value: 'Weather', label: 'Weather' },
  { value: 'Alarm', label: 'Alarm' },
  { value: 'Settings', label: 'Settings' },
  { value: 'Music', label: 'Music' },
  { value: 'Notification', label: 'Notifications' },
  { value: 'StopWatch', label: 'Stopwatch' },
  { value: 'Timer', label: 'Timer' },
  { value: 'Compass', label: 'Compass' },
  { value: 'Barometer', label: 'Barometer' },
  { value: 'WorldClock', label: 'World Clock' },
];

const TYPE_LABELS: Record<string, string> = {
  ARC_PROGRESS: 'Arc Progress',
  TIME_POINTER: 'Clock Hands',
  TEXT_IMG: 'Text Image',
  IMG: 'Image',
  IMG_TIME: 'Time Image',
  IMG_DATE: 'Date Image',
  IMG_WEEK: 'Week Image',
  IMG_LEVEL: 'Level Image',
  IMG_STATUS: 'Status Image',
  TEXT: 'Text',
  CIRCLE: 'Circle',
  BUTTON: 'Button',
};

export function PropertyPanel({ element, onUpdateElement, className }: PropertyPanelProps) {
  if (!element) {
    return (
      <div className={`rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/40 ${className ?? ''}`}>
        Click element on canvas to edit
      </div>
    );
  }

  const update = (changes: Partial<WatchFaceElement>) => onUpdateElement?.(element.id, changes);

  const handleTypeChange = (newType: WatchFaceElement['type']) => {
    if (newType === element.type) return;
    const changes: Partial<WatchFaceElement> = { type: newType };
    switch (newType) {
      case 'ARC_PROGRESS':
        changes.center = element.center ?? { x: 240, y: 240 };
        changes.radius = element.radius ?? 100;
        changes.startAngle = element.startAngle ?? 135;
        changes.endAngle = element.endAngle ?? 345;
        changes.lineWidth = element.lineWidth ?? 8;
        changes.color = element.color ?? '0x00FF00';
        break;
      case 'TIME_POINTER':
        changes.center = { x: 240, y: 240 };
        changes.hourPos = { x: 11, y: 70 };
        changes.minutePos = { x: 8, y: 100 };
        changes.secondPos = { x: 3, y: 120 };
        break;
      case 'TEXT':
        changes.fontSize = element.fontSize ?? 20;
        changes.color = element.color ?? '0xFFFFFFFF';
        changes.text = element.text ?? '';
        break;
      case 'CIRCLE':
        changes.center = element.center ?? { x: element.bounds.x + element.bounds.width / 2, y: element.bounds.y + element.bounds.height / 2 };
        changes.radius = element.radius ?? Math.min(element.bounds.width, element.bounds.height) / 2;
        changes.color = element.color ?? '0xFFFFFF';
        break;
    }
    update(changes);
  };

  const setX = (v: number) => update({ bounds: { ...element.bounds, x: clamp(v, 0, 480) } });
  const setY = (v: number) => update({ bounds: { ...element.bounds, y: clamp(v, 0, 480) } });
  const setW = (v: number) => update({ bounds: { ...element.bounds, width: clamp(v, 1, 480) } });
  const setH = (v: number) => update({ bounds: { ...element.bounds, height: clamp(v, 1, 480) } });

  const isCentered = element.type === 'ARC_PROGRESS' || element.type === 'TIME_POINTER';
  const isSizeLocked = false; // Allow resizing all elements in editor

  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 p-4 space-y-4 ${className ?? ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          {TYPE_LABELS[element.type] ?? element.type}
        </span>
        <span className="text-xs text-white/40 truncate max-w-[140px]">{element.name}</span>
      </div>

      {/* Widget Type */}
      <Section label="Widget Type">
        <Select value={element.type} onValueChange={v => handleTypeChange(v as WatchFaceElement['type'])}>
          <SelectTrigger className="w-full h-7 text-xs bg-zinc-800 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WIDGET_TYPES.map(wt => (
              <SelectItem key={wt} value={wt}>{TYPE_LABELS[wt] ?? wt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Section>

      {/* Position */}
      <Section label="Position">
        {isCentered ? (
          <FieldRow>
            <NumField label="CX" value={element.center?.x ?? 240} onChange={v => update({ center: { x: clamp(v, 0, 480), y: element.center?.y ?? 240 } })} />
            <NumField label="CY" value={element.center?.y ?? 240} onChange={v => update({ center: { x: element.center?.x ?? 240, y: clamp(v, 0, 480) } })} />
          </FieldRow>
        ) : (
          <FieldRow>
            <NumField label="X" value={element.bounds.x} onChange={setX} />
            <NumField label="Y" value={element.bounds.y} onChange={setY} />
          </FieldRow>
        )}
      </Section>

      {/* Size — hidden for centered (arc/pointer) elements */}
      {!isCentered && (
        <Section label="Size">
          <FieldRow>
            <NumField label="W" value={element.bounds.width} onChange={setW} disabled={isSizeLocked} />
            <NumField label="H" value={element.bounds.height} onChange={setH} disabled={isSizeLocked} />
          </FieldRow>
          {isSizeLocked && (
            <p className="text-[10px] text-white/30 mt-1">Size determined by digit images</p>
          )}
        </Section>
      )}

      {/* Color */}
      {element.color !== undefined && (
        <Section label="Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={toCssColor(element.color)}
              onChange={e => update({ color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
            />
            <Input
              value={toCssColor(element.color)}
              onChange={e => update({ color: e.target.value })}
              className="h-7 text-xs font-mono bg-white/5 border-white/10 text-white"
            />
          </div>
        </Section>
      )}

      {/* DataType — shown for all data-bindable elements */}
      {['ARC_PROGRESS', 'TEXT_IMG', 'IMG', 'IMG_LEVEL', 'TEXT', 'CIRCLE', 'IMG_STATUS'].includes(element.type) && (
        <Section label="Data Type">
          <Select value={element.dataType ?? '__none__'} onValueChange={v => update({ dataType: v === '__none__' ? undefined : v })}>
            <SelectTrigger className="w-full h-7 text-xs bg-zinc-800 border-white/10 text-white">
              <SelectValue placeholder="— none —" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— none —</SelectItem>
              {DATA_TYPES.map(dt => (
                <SelectItem key={dt} value={dt}>{dt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Section>
      )}

      {/* ARC-specific fields */}
      {element.type === 'ARC_PROGRESS' && (
        <>
          <Section label="Arc Shape">
            <FieldRow>
              <NumField label="R" value={element.radius ?? 100} onChange={v => update({ radius: clamp(v, 10, 240) })} />
              <NumField label="LW" value={element.lineWidth ?? 8} onChange={v => update({ lineWidth: clamp(v, 1, 40) })} />
            </FieldRow>
            <FieldRow>
              <NumField label="Sta°" value={element.startAngle ?? 135} onChange={v => update({ startAngle: v })} />
              <NumField label="End°" value={element.endAngle ?? 345} onChange={v => update({ endAngle: v })} />
            </FieldRow>
          </Section>
        </>
      )}

      {/* TIME_POINTER-specific fields */}
      {element.type === 'TIME_POINTER' && (
        <Section label="Hands">
          <p className="text-[10px] text-white/30">Hand images auto-sized from assets. Drag on canvas to reposition.</p>
        </Section>
      )}

      {/* Icon picker — IMG elements only */}
      {element.type === 'IMG' && (
        <Section label="Icon">
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {/* None button */}
            <button
              onClick={() => update({ iconKey: undefined })}
              className={cn(
                'w-full h-7 rounded border text-[10px] text-white/40',
                !element.iconKey ? 'border-cyan-500 bg-cyan-500/20' : 'border-white/10 bg-white/5'
              )}
            >
              None
            </button>
            {(['health', 'activity', 'environment', 'system', 'time'] as const).map(cat => {
              const icons = getIconLibrary().filter(i => i.category === cat);
              if (icons.length === 0) return null;
              return (
                <div key={cat}>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">{cat}</p>
                  <div className="grid grid-cols-6 gap-1">
                    {icons.map(icon => (
                      <button
                        key={icon.key}
                        onClick={() => update({ iconKey: icon.key })}
                        className={cn(
                          'p-1 rounded border',
                          element.iconKey === icon.key ? 'border-cyan-500 bg-cyan-500/20' : 'border-white/10 bg-white/5 hover:border-white/30'
                        )}
                        title={icon.label}
                      >
                        <img src={icon.dataUrl} alt={icon.label} className="w-6 h-6 object-contain" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Font style picker — text/digit elements */}
      {['IMG_TIME', 'TEXT_IMG', 'TEXT', 'IMG_DATE'].includes(element.type) && (
        <Section label="Font Style">
          <div className="rounded-md border border-white/10 overflow-hidden">
            {/* Selected font preview */}
            <div className="px-3 py-2 bg-zinc-800 border-b border-white/10 flex items-center justify-between">
              <span style={{
                fontFamily: getFontStyle(element.fontStyle ?? 'bold-white').fontFamily,
                fontWeight: getFontStyle(element.fontStyle ?? 'bold-white').fontWeight,
                color: getFontStyle(element.fontStyle ?? 'bold-white').color,
                fontSize: '20px',
              }}>
                12:34
              </span>
              <span className="text-[10px] text-white/40">{getFontStyle(element.fontStyle ?? 'bold-white').label}</span>
            </div>
            {/* Scrollable list */}
            <div className="max-h-48 overflow-y-auto bg-zinc-900">
              {FONT_STYLES.map(style => (
                <button
                  key={style.key}
                  onClick={() => update({ fontStyle: style.key, color: style.color })}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors',
                    (element.fontStyle ?? 'bold-white') === style.key
                      ? 'bg-cyan-500/20 border-l-2 border-cyan-500'
                      : 'border-l-2 border-transparent hover:bg-white/5'
                  )}
                >
                  <span style={{
                    fontFamily: style.fontFamily,
                    fontWeight: style.fontWeight,
                    color: style.color,
                    fontSize: '18px',
                  }}>
                    12:34
                  </span>
                  <span className="text-[10px] text-white/30 shrink-0 ml-2">
                    {style.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Curved Text — TEXT elements only */}
      {element.type === 'TEXT' && (
        <Section label="Curved Text">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={!!element.curvedText}
              onChange={e => {
                if (e.target.checked) {
                  update({ curvedText: { radius: 180, startAngle: -45, endAngle: 45 } });
                } else {
                  update({ curvedText: undefined });
                }
              }}
              className="rounded"
            />
            <span className="text-xs text-white/60">Enable arc text</span>
          </div>
          {element.curvedText && (
            <div className="space-y-2">
              <FieldRow>
                <NumField label="Radius" value={element.curvedText.radius} onChange={v => update({ curvedText: { ...element.curvedText!, radius: v } })} />
              </FieldRow>
              <FieldRow>
                <NumField label="Start°" value={element.curvedText.startAngle} onChange={v => update({ curvedText: { ...element.curvedText!, startAngle: v } })} />
                <NumField label="End°" value={element.curvedText.endAngle} onChange={v => update({ curvedText: { ...element.curvedText!, endAngle: v } })} />
              </FieldRow>
            </div>
          )}
        </Section>
      )}

      {/* App Shortcut */}
      <Section label="App Shortcut">
        <Select value={element.clickAction ?? '__none__'} onValueChange={v => update({ clickAction: v === '__none__' ? undefined : v })}>
          <SelectTrigger className="w-full h-7 text-xs bg-zinc-800 border-white/10 text-white">
            <SelectValue placeholder="— none —" />
          </SelectTrigger>
          <SelectContent>
            {APP_SHORTCUTS.map(s => (
              <SelectItem key={s.value || '__none__'} value={s.value || '__none__'}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Section>

      {/* Visible + zIndex */}
      <Section label="Layer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={element.visible}
              onCheckedChange={v => update({ visible: v })}
              id={`vis-${element.id}`}
            />
            <Label htmlFor={`vis-${element.id}`} className="text-xs text-white/60">Visible</Label>
          </div>
          <NumField label="Z" value={element.zIndex} onChange={v => update({ zIndex: v })} />
        </div>
      </Section>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
      {children}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2">{children}</div>;
}

function NumField({ label, value, onChange, disabled }: { label: string; value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-1 flex-1">
      <span className="text-[10px] text-white/40 w-4 shrink-0">{label}</span>
      <Input
        type="number"
        value={Math.round(value)}
        onChange={e => onChange(Number(e.target.value))}
        disabled={disabled}
        className={cn(
          'h-7 text-xs bg-white/5 border-white/10 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function toCssColor(color: string): string {
  if (color.startsWith('0x') || color.startsWith('0X')) {
    return '#' + color.slice(2).padStart(6, '0');
  }
  return color.startsWith('#') ? color : '#ffffff';
}
