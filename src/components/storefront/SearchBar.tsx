import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  /** If true, renders as a compact inline bar (header). If false, renders larger (hero). */
  compact?: boolean;
}

export function SearchBar({ compact = false }: SearchBarProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value when navigating back to search page with different query
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setValue(q);
  }, [searchParams]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleClear() {
    setValue('');
    inputRef.current?.focus();
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search
          size={15}
          className="absolute left-3 text-zinc-500 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search watchfaces…"
          className="
            w-52 pl-8 pr-8 py-1.5 text-sm rounded-lg
            bg-zinc-900 border border-zinc-700
            text-zinc-100 placeholder-zinc-500
            focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500
            transition-colors
          "
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </form>
    );
  }

  // Full-size variant (used in hero / search page)
  return (
    <form onSubmit={handleSubmit} className="relative flex items-center w-full max-w-xl">
      <Search
        size={18}
        className="absolute left-4 text-zinc-500 pointer-events-none"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name, hashtag, style…"
        className="
          w-full pl-11 pr-12 py-3 text-base rounded-xl
          bg-zinc-900 border border-zinc-700
          text-zinc-100 placeholder-zinc-500
          focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-600
          transition-colors
        "
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
}
