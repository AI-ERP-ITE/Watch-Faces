import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCatalog } from '@/context/CatalogContext';
import { WatchfaceGrid } from './WatchfaceGrid';

export function ModelPage() {
  const { slug } = useParams<{ slug: string }>();
  const { models, specGroups, getByModel, baseUrl, loading, error } = useCatalog();

  const model = slug ? models[slug] : null;
  const specGroup = model ? specGroups[model.specGroup] : null;

  const entries = useMemo(
    () => (slug ? getByModel(slug) : []),
    [slug, getByModel]
  );

  // Other models that share the same spec group
  const sibling = useMemo(() => {
    if (!model) return [];
    return Object.entries(models).filter(
      ([s, m]) => s !== slug && m.specGroup === model.specGroup
    );
  }, [models, model, slug]);

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

  if (!model) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <span className="text-5xl">⌚</span>
        <p className="text-sm">Model not found.</p>
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
            <span className="text-zinc-300">{model.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">
                {model.brand.charAt(0).toUpperCase() + model.brand.slice(1)}
              </p>
              <h1 className="text-2xl font-bold text-white">{model.name}</h1>
              {specGroup && (
                <p className="text-xs text-zinc-500 mt-1">
                  {specGroup.resolution} · {specGroup.shape} · API {specGroup.apiVersion.toUpperCase()}
                </p>
              )}
            </div>

            <div className="sm:ml-auto flex items-center gap-2">
              <span className="text-xs text-zinc-500">
                {entries.length} watchface{entries.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Sibling models (same spec group) */}
          {sibling.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-zinc-500">Also works on:</span>
              {sibling.map(([s, m]) => (
                <Link
                  key={s}
                  to={`/model/${s}`}
                  className="px-2.5 py-1 rounded-full text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
                >
                  {m.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <WatchfaceGrid
          entries={entries}
          baseUrl={baseUrl}
          emptyMessage={`No watchfaces yet for ${model.name}.`}
        />
      </section>
    </div>
  );
}
