import { useState } from 'react';
import { WatchfaceCard } from './WatchfaceCard';
import type { CatalogEntry } from '@/context/CatalogContext';

const PAGE_SIZE = 24;

interface WatchfaceGridProps {
  entries: CatalogEntry[];
  baseUrl: string;
  /** Optional message shown when entries array is empty */
  emptyMessage?: string;
}

export function WatchfaceGrid({
  entries,
  baseUrl,
  emptyMessage = 'No watchfaces found.',
}: WatchfaceGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visible = entries.slice(0, visibleCount);
  const hasMore = visibleCount < entries.length;

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-zinc-500">
        <span className="text-5xl">⌚</span>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {visible.map((entry) => (
          <WatchfaceCard key={entry.id} entry={entry} baseUrl={baseUrl} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="px-6 py-2.5 text-sm font-medium rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            Load more ({entries.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Total count */}
      <p className="text-center text-xs text-zinc-600">
        Showing {Math.min(visibleCount, entries.length)} of {entries.length} watchfaces
      </p>
    </div>
  );
}
