import { useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCatalog } from '@/context/CatalogContext';
import { Download, ArrowLeft } from 'lucide-react';
import { trackDownload } from '@/lib/firebaseTracking';

export function SuccessPage() {
  const { id } = useParams<{ id: string }>();
  const { getById, baseUrl, loading, error } = useCatalog();

  const entry = id ? getById(id) : null;

  // Build direct download URL
  const zpkUrl = entry ? `${baseUrl}${entry.zpkPath}` : null;

  // Auto-trigger download for free watchfaces
  const triggerDownload = useCallback(() => {
    if (!zpkUrl || !entry) return;
    // Fire-and-forget download count (non-blocking)
    void trackDownload(entry.id);
    const a = document.createElement('a');
    a.href = zpkUrl;
    a.download = `${entry.id}.zpk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [zpkUrl, entry]);

  useEffect(() => {
    if (entry && entry.price === 0) {
      // Small delay so page renders before download dialog appears
      const t = setTimeout(triggerDownload, 800);
      return () => clearTimeout(t);
    }
  }, [entry, triggerDownload]);

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

  if (!entry) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <span className="text-5xl">⌚</span>
        <p className="text-sm">Watchface not found.</p>
        <Link to="/" className="text-xs underline underline-offset-4 hover:text-zinc-200">
          Back to Browse
        </Link>
      </div>
    );
  }

  const isFree = entry.price === 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs text-zinc-600 uppercase tracking-widest font-mono">
            Flowvault
          </p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isFree ? 'Your watchface is ready!' : 'Thank you for your purchase!'}
          </h1>
          {isFree && (
            <p className="text-zinc-500 text-sm">
              Download starting automatically…
            </p>
          )}
        </div>

        {/* Preview */}
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
          <div className="px-4 py-3">
            <p className="text-white font-medium text-sm">{entry.name}</p>
            <p className="text-zinc-500 text-xs mt-0.5 capitalize">
              {entry.categories.join(' · ')}
            </p>
          </div>
        </div>

        {/* QR code */}
        {entry.qrPath && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-zinc-500 text-xs text-center">
              Or scan with the Zepp app to install directly on your watch
            </p>
            <div className="rounded-xl border border-zinc-800 bg-white p-3 w-36 h-36">
              <img
                src={`${baseUrl}${entry.qrPath}`}
                alt="Install QR code"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Download button (manual fallback or paid post-checkout) */}
        {zpkUrl && (
          <button
            onClick={triggerDownload}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download .zpk
          </button>
        )}

        {/* Browse more */}
        <p className="text-center text-zinc-600 text-xs">
          <Link
            to="/"
            className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-zinc-400 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Browse more watchfaces
          </Link>
        </p>
      </div>
    </div>
  );
}
