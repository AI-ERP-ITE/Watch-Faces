import { useParams, Link } from 'react-router-dom';
import { useCatalog } from '@/context/CatalogContext';
import { ExternalLink } from 'lucide-react';

export function BuyPage() {
  const { id } = useParams<{ id: string }>();
  const { getById, baseUrl, loading, error } = useCatalog();

  const entry = id ? getById(id) : null;

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

  if (!entry || !entry.stripeLink) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <span className="text-5xl">⌚</span>
        <p className="text-sm">Watchface not found or not available for purchase.</p>
        <Link to="/" className="text-xs underline underline-offset-4 hover:text-zinc-200">
          Back to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo / brand */}
        <div className="text-center space-y-1">
          <p className="text-xs text-zinc-600 uppercase tracking-widest font-mono">
            Flowvault
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Complete Your Purchase
          </h1>
        </div>

        {/* Preview card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          {entry.previewPath && (
            <div className="aspect-square w-full overflow-hidden bg-zinc-800">
              <img
                src={`${baseUrl}${entry.previewPath}`}
                alt={entry.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">{entry.name}</p>
              <p className="text-zinc-500 text-xs mt-0.5 capitalize">
                {entry.categories.join(' · ')}
              </p>
            </div>
            <span className="text-white font-bold text-lg">
              ${entry.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* CTA */}
        <a
          href={entry.stripeLink}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-colors"
        >
          Continue to Checkout
          <ExternalLink className="h-4 w-4" />
        </a>

        {/* Back link */}
        <p className="text-center text-zinc-600 text-xs">
          Changed your mind?{' '}
          <Link
            to={`/face/${entry.id}`}
            className="underline underline-offset-4 hover:text-zinc-400 transition-colors"
          >
            Go back
          </Link>
        </p>
      </div>
    </div>
  );
}
