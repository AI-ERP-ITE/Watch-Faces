import { Link, Outlet, useLocation } from 'react-router-dom';
import { SearchBar } from './SearchBar';

export function StorefrontLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-xs">FV</span>
            </div>
            <span className="font-semibold text-zinc-100 tracking-tight group-hover:text-white transition-colors">
              Flowvault
            </span>
          </Link>

          {/* Nav links (hidden on small screens) */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <NavLink to="/" label="Browse" currentPath={location.pathname} />
            <NavLink to="/category/premium" label="Premium" currentPath={location.pathname} />
            <NavLink to="/category/simple" label="Simple" currentPath={location.pathname} />
            <NavLink to="/category/funny" label="Funny" currentPath={location.pathname} />
          </nav>

          {/* Right: search + studio link */}
          <div className="flex items-center gap-3">
            <SearchBar compact />
            <Link
              to="/studio"
              className="
                hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                bg-zinc-800 border border-zinc-700 text-zinc-300
                hover:bg-zinc-700 hover:text-white transition-colors
              "
            >
              Studio
            </Link>
          </div>

        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/60 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-[9px]">FV</span>
            </div>
            <span>Flowvault</span>
          </div>
          <p className="text-zinc-600 text-xs">
            Premium watchfaces for Amazfit &amp; ZeppOS devices
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/" className="hover:text-zinc-300 transition-colors">Browse</Link>
            <Link to="/studio" className="hover:text-zinc-300 transition-colors">Creator Studio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Small helper: active-aware nav link ────────────────────────────────────

function NavLink({
  to,
  label,
  currentPath,
}: {
  to: string;
  label: string;
  currentPath: string;
}) {
  const isActive =
    to === '/'
      ? currentPath === '/'
      : currentPath.startsWith(to);

  return (
    <Link
      to={to}
      className={`
        px-3 py-1.5 rounded-md transition-colors
        ${isActive
          ? 'text-zinc-100 bg-zinc-800'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
        }
      `}
    >
      {label}
    </Link>
  );
}
