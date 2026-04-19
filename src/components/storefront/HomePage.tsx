import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCatalog, type FilterState, type SortOption } from '@/context/CatalogContext';
import { FilterSidebar } from './FilterSidebar';
import { SortControls } from './SortControls';
import { WatchfaceGrid } from './WatchfaceGrid';

// ── Category metadata ──────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'minimal',  label: 'Minimal',  emoji: '◻' },
  { slug: 'sporty',   label: 'Sporty',   emoji: '⚡' },
  { slug: 'elegant',  label: 'Elegant',  emoji: '✦' },
  { slug: 'digital',  label: 'Digital',  emoji: '▦' },
  { slug: 'analog',   label: 'Analog',   emoji: '◷' },
  { slug: 'funny',    label: 'Funny',    emoji: '★' },
];

// ── Component ──────────────────────────────────────────────────────────────

export function HomePage() {
  const { models, loading, error, getFiltered, baseUrl } = useCatalog();
  const [searchParams] = useSearchParams();

  // Seed from URL if coming from SearchBar
  const urlQuery = searchParams.get('q') ?? '';

  const [filters, setFilters] = useState<FilterState>({
    brand: null,
    modelSlug: null,
    priceFilter: 'all',
    sortBy: 'latest',
    searchQuery: urlQuery,
  });

  function updateFilter(partial: Partial<FilterState>) {
    setFilters((prev) => ({ ...prev, ...partial }));
  }

  const results = useMemo(() => getFiltered(filters), [getFiltered, filters]);

  // ── Model chip list ──────────────────────────────────────────────────────
  const modelList = useMemo(() => Object.entries(models), [models]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero */}
      <section className="border-b border-zinc-800/60 py-10 px-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Flowvault Watchfaces
        </h1>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          Premium Zepp OS watchfaces for Amazfit. Free &amp; paid, all spec-matched to your device.
        </p>
      </section>

      {/* Model chips */}
      <section className="border-b border-zinc-800/60 px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 w-max mx-auto">
          <ModelChip
            label="All Models"
            active={filters.modelSlug === null && filters.brand === null}
            onClick={() => updateFilter({ modelSlug: null, brand: null })}
          />
          {modelList.map(([slug, model]) => (
            <ModelChip
              key={slug}
              label={model.name}
              active={filters.modelSlug === slug}
              onClick={() =>
                updateFilter({
                  modelSlug: filters.modelSlug === slug ? null : slug,
                  brand: null,
                })
              }
            />
          ))}
        </div>
      </section>

      {/* Category cards */}
      <section className="px-6 py-6 border-b border-zinc-800/60">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-w-4xl mx-auto">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 transition-colors"
            >
              <span className="text-lg">{cat.emoji}</span>
              <span className="text-xs text-zinc-400">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Main: sidebar + grid */}
      <section className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <FilterSidebar filters={filters} onChange={updateFilter} />
        </aside>

        {/* Right: sort + grid */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Mobile filter row */}
          <div className="lg:hidden">
            <MobileFilterRow filters={filters} onChange={updateFilter} />
          </div>

          <SortControls
            value={filters.sortBy}
            onChange={(v: SortOption) => updateFilter({ sortBy: v })}
            count={results.length}
          />

          {loading && (
            <div className="text-center py-16 text-zinc-500 text-sm">Loading…</div>
          )}
          {error && (
            <div className="text-center py-16 text-red-400 text-sm">{error}</div>
          )}
          {!loading && !error && (
            <WatchfaceGrid entries={results} baseUrl={baseUrl} />
          )}
        </div>
      </section>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ModelChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
        ${active
          ? 'bg-zinc-100 text-zinc-900'
          : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
        }
      `}
    >
      {label}
    </button>
  );
}

function MobileFilterRow({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (p: Partial<FilterState>) => void;
}) {
  const { models } = useCatalog();
  const brands = useMemo(
    () => Array.from(new Set(Object.values(models).map((m) => m.brand))).sort(),
    [models]
  );

  return (
    <div className="flex gap-2 flex-wrap">
      {/* Brand select */}
      <select
        value={filters.brand ?? ''}
        onChange={(e) => onChange({ brand: e.target.value || null, modelSlug: null })}
        className="text-xs rounded-lg px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 focus:outline-none"
      >
        <option value="">All Brands</option>
        {brands.map((b) => (
          <option key={b} value={b}>
            {b.charAt(0).toUpperCase() + b.slice(1)}
          </option>
        ))}
      </select>

      {/* Price select */}
      <select
        value={filters.priceFilter}
        onChange={(e) =>
          onChange({ priceFilter: e.target.value as FilterState['priceFilter'] })
        }
        className="text-xs rounded-lg px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 focus:outline-none"
      >
        <option value="all">All Prices</option>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
      </select>
    </div>
  );
}
