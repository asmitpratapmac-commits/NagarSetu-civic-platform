import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NAV_LINKS = [
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'Map', to: '/#city-map' },
  { label: 'Analytics', to: '/#analytics' },
];

export const PublicLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const dashboardPath = role ? `/${role}/dashboard` : '/login';

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-surface/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-char-950">
              <span className="font-display text-sm font-semibold text-mint-200">N</span>
            </div>
            <span className="font-display text-lg font-medium text-char-950">NagarSetu AI</span>
          </Link>

          {isLanding && (
            <nav className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <a key={link.to} href={link.to} className="text-sm font-medium text-char-700 hover:text-char-950">
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <Link to={dashboardPath} className="btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary">
                  Report an Issue
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-stone-200 px-5 py-4 md:hidden">
            {isLanding &&
              NAV_LINKS.map((link) => (
                <a key={link.to} href={link.to} className="block py-2 text-sm font-medium text-char-700">
                  {link.label}
                </a>
              ))}
            <div className="mt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link to={dashboardPath} className="btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-outline">
                    Log in
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Report an Issue
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <Outlet />

      <footer className="border-t border-stone-200 bg-char-950 text-stone-300">
        <div className="container-page grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600">
                <span className="font-display text-xs font-semibold text-white">N</span>
              </div>
              <span className="font-display font-medium text-white">NagarSetu AI</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-stone-400">
              Connecting citizens with the people who fix their city — faster, and with a record you can trust.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-stone-400">
              <li><a href="/#how-it-works" className="hover:text-white">How it works</a></li>
              <li><a href="/#city-map" className="hover:text-white">City map</a></li>
              <li><a href="/#analytics" className="hover:text-white">Analytics</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Portals</p>
            <ul className="mt-3 space-y-2 text-sm text-stone-400">
              <li><Link to="/register" className="hover:text-white">Citizen sign up</Link></li>
              <li><Link to="/login" className="hover:text-white">Authority login</Link></li>
              <li><Link to="/login" className="hover:text-white">Admin login</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-stone-400">
              <li>support@nagarsetu.ai</li>
              <li>Municipal Corporation Partnerships</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5">
          <p className="container-page text-xs text-stone-500">© {new Date().getFullYear()} NagarSetu AI. Built for cities that listen.</p>
        </div>
      </footer>
    </div>
  );
};
