import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { WatchFaceElement } from '@/types';

export interface PropertyPanelProps {
  element: WatchFaceElement | null;
  onUpdateElement?: (id: string, changes: Partial<WatchFaceElement>) => void;
  className?: string;
}

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

  const setX = (v: number) => update({ bounds: { ...element.bounds, x: clamp(v, 0, 480) } });
  const setY = (v: number) => update({ bounds: { ...element.bounds, y: clamp(v, 0, 480) } });
  const setW = (v: number) => update({ bounds: { ...element.bounds, width: clamp(v, 1, 480) } });
  const setH = (v: number) => update({ bounds: { ...element.bounds, height: clamp(v, 1, 480) } });

  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 p-4 space-y-4 ${className ?? ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          {TYPE_LABELS[element.type] ?? element.type}
        </span>
        <span className="text-xs text-white/40 truncate max-w-[140px]">{element.name}</span>
      </div>

      {/* Position */}
      <Section label="Position">
        <FieldRow>
          <NumField label="X" value={element.bounds.x} onChange={setX} />
          <NumField label="Y" value={element.bounds.y} onChange={setY} />
        </FieldRow>
      </Section>

      {/* Size */}
      <Section label="Size">
        <FieldRow>
          <NumField label="W" value={element.bounds.width} onChange={setW} />
          <NumField label="H" value={element.bounds.height} onChange={setH} />
        </FieldRow>
      </Section>

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

      {/* ARC-specific fields (T009) */}
      {element.type === 'ARC_PROGRESS' && (
        <>
          <Section label="Arc Center">
            <FieldRow>
              <NumField label="CX" value={element.center?.x ?? 240} onChange={v => update({ center: { ...element.center, x: clamp(v, 0, 480), y: element.center?.y ?? 240 } })} />
              <NumField label="CY" value={element.center?.y ?? 240} onChange={v => update({ center: { ...element.center, x: element.center?.x ?? 240, y: clamp(v, 0, 480) } })} />
            </FieldRow>
          </Section>
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
          <Section label="Data Type">
            <select
              value={element.dataType ?? ''}
              onChange={e => update({ dataType: e.target.value || undefined })}
              className="w-full h-7 rounded-md text-xs bg-white/5 border border-white/10 text-white px-2 cursor-pointer"
            >
              <option value="">— none —</option>
              {['BATTERY','STEP','HEART','SPO2','CAL','DISTANCE','STRESS','PAI','SLEEP','STAND','FAT_BURN'].map(dt => (
                <option key={dt} value={dt}>{dt}</option>
              ))}
            </select>
          </Section>
        </>
      )}

      {/* TIME_POINTER-specific fields (T010) */}
      {element.type === 'TIME_POINTER' && (
        <Section label="Pointer Center">
          <FieldRow>
            <NumField
              label="CX"
              value={element.pointerCenter?.x ?? element.center?.x ?? 240}
              onChange={v => update({ pointerCenter: { x: clamp(v, 0, 480), y: element.pointerCenter?.y ?? element.center?.y ?? 240 } })}
            />
            <NumField
              label="CY"
              value={element.pointerCenter?.y ?? element.center?.y ?? 240}
              onChange={v => update({ pointerCenter: { x: element.pointerCenter?.x ?? element.center?.x ?? 240, y: clamp(v, 0, 480) } })}
            />
          </FieldRow>
          <p className="text-[10px] text-white/30 mt-1">Hand images auto-sized from assets</p>
        </Section>
      )}

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

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 flex-1">
      <span className="text-[10px] text-white/40 w-4 shrink-0">{label}</span>
      <Input
        type="number"
        value={Math.round(value)}
        onChange={e => onChange(Number(e.target.value))}
        className="h-7 text-xs bg-white/5 border-white/10 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
