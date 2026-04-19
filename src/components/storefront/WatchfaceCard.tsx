import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import type { CatalogEntry } from '@/context/CatalogContext';

interface WatchfaceCardProps {
  entry: CatalogEntry;
  baseUrl: string;
}

export function WatchfaceCard({ entry, baseUrl }: WatchfaceCardProps) {
  const previewSrc = `${baseUrl}${entry.previewPath}`;
  const isFree = entry.price === 0;

  return (
    <Link
      to={`/face/${entry.id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all duration-200 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5"
    >
      {/* Preview image */}
      <div className="relative aspect-square bg-zinc-800 overflow-hidden">
        <img
          src={previewSrc}
          alt={entry.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback placeholder if image not loaded
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />

        {/* Fallback icon when image missing */}
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 -z-10">
          <div className="w-16 h-16 rounded-full border-2 border-zinc-700 flex items-center justify-center">
            <span className="text-zinc-600 text-2xl">⌚</span>
          </div>
        </div>

        {/* Price badge — top right */}
        <div className="absolute top-2.5 right-2.5">
          {isFree ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
              FREE
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 backdrop-blur-sm">
              ${entry.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Download count — bottom left */}
        {entry.downloads > 0 && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-zinc-400 bg-black/50 backdrop-blur-sm border border-zinc-700/50">
              <Download size={10} />
              {entry.downloads >= 1000
                ? `${(entry.downloads / 1000).toFixed(1)}k`
                : entry.downloads}
            </span>
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
            {entry.name}
          </p>
          {entry.categories.length > 0 && (
            <p className="text-xs text-zinc-500 truncate mt-0.5 capitalize">
              {entry.categories[0]}
            </p>
          )}
        </div>

        {/* Hover action indicator */}
        <div className="shrink-0 w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-zinc-300 text-xs">→</span>
        </div>
      </div>
    </Link>
  );
}
