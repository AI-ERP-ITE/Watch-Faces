import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCatalog } from '@/context/CatalogContext';
import { WatchfaceGrid } from './WatchfaceGrid';

const CATEGORY_META: Record<string, { label: string; description: string; emoji: string }> = {
  minimal:  { label: 'Minimal',  emoji: '◻', description: 'Clean, distraction-free faces that put data first.' },
  sporty:   { label: 'Sporty',   emoji: '⚡', description: 'Built for athletes — health metrics front and center.' },
  elegant:  { label: 'Elegant',  emoji: '✦', description: 'Refined designs inspired by classic watchmaking.' },
  digital:  { label: 'Digital',  emoji: '▦', description: 'Bold numerals and high-contrast readouts.' },
  analog:   { label: 'Analog',   emoji: '◷', description: 'Classic hand-based designs reimagined for smart displays.' },
  funny:    { label: 'Funny',    emoji: '★', description: 'Playful, personality-packed faces for every mood.' },
  premium:  { label: 'Premium',  emoji: '◈', description: 'Our best paid watchfaces — hand-crafted and polished.' },
  simple:   { label: 'Simple',   emoji: '○', description: 'Lightweight faces with just the essentials.' },
};

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getByCategory, baseUrl, loading, error } = useCatalog();

  const meta = slug ? (CATEGORY_META[slug] ?? { label: slug, emoji: '⌚', description: '' }) : null;

  const entries = useMemo(
    () => (slug ? getByCategory(slug) : []),
    [slug, getByCategory]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 text-sm">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400 text-sm">
        {error}
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <span className="text-5xl">⌚</span>
        <p className="text-sm">Category not found.</p>
        <Link to="/" className="text-xs underline underline-offset-4 hover:text-zinc-200">
          Back to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header band */}
      <section className="border-b border-zinc-800/60 py-8 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
            <Link to="/" className="hover:text-zinc-300 transition-colors">Browse</Link>
            <span>/</span>
            <span className="text-zinc-300">{meta.label}</span>
          </nav>

          <div className="flex items-end gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{meta.emoji}</span>
                <h1 className="text-2xl font-bold text-white">{meta.label}</h1>
              </div>
              {meta.description && (
                <p className="text-sm text-zinc-400 max-w-md">{meta.description}</p>
              )}
            </div>
            <div className="ml-auto">
              <span className="text-xs text-zinc-500">
                {entries.length} watchface{entries.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Other categories */}
          <div className="mt-5 flex flex-wrap gap-2">
            {Object.entries(CATEGORY_META)
              .filter(([s]) => s !== slug)
              .map(([s, m]) => (
                <Link
                  key={s}
                  to={`/category/${s}`}
                  className="px-2.5 py-1 rounded-full text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
                >
                  {m.emoji} {m.label}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <WatchfaceGrid
          entries={entries}
          baseUrl={baseUrl}
          emptyMessage={`No ${meta.label.toLowerCase()} watchfaces yet.`}
        />
      </section>
    </div>
  );
}
