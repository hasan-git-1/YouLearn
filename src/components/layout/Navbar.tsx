'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, BookOpen, Bookmark, User as UserIcon, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, openAuthModal, signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isHomePage = pathname === '/';

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = query.trim();
      if (q.length >= 2) {
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }
    },
    [query, router]
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(8, 11, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="mx-auto flex items-center justify-between gap-4 px-4 py-3"
        style={{ maxWidth: '1280px' }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0"
          style={{ textDecoration: 'none' }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              boxShadow: '0 0 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            <BookOpen size={18} color="white" strokeWidth={2.5} />
          </div>
          <span
            className="font-black text-lg hidden sm:block tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, #ffffff, #cbd5e1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Tubiq
          </span>
        </Link>

        {/* Search bar — hidden on homepage to keep single big hero search bar */}
        {!isHomePage ? (
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-2">
            <div className="relative flex items-center">
              <Search
                size={15}
                className="absolute left-3.5 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                id="navbar-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, videos, topics…"
                className="input-base pl-10 pr-4 py-2 text-sm w-full"
                style={{ borderRadius: 'var(--radius-md)' }}
                autoComplete="off"
              />
            </div>
          </form>
        ) : (
          <div className="flex-1" />
        )}

        {/* Right Nav / User Controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Link
            href="/library"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            style={{ textDecoration: 'none' }}
          >
            <Bookmark size={14} className="text-indigo-400" />
            <span className="hidden sm:inline">My Library</span>
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs text-white transition-transform hover:scale-105 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)',
                }}
                aria-label="User profile menu"
              >
                {userInitial}
              </button>

              {/* User Dropdown */}
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl p-2 animate-fade-up shadow-2xl z-50"
                  style={{
                    background: 'rgba(15, 18, 35, 0.96)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="px-3 py-2.5 border-b border-white/5">
                    <p className="text-xs font-semibold text-white truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-indigo-400">
                      <Sparkles size={11} />
                      <span>Free Learner Tier</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/library"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      style={{ textDecoration: 'none' }}
                    >
                      <Bookmark size={14} className="text-indigo-400" />
                      <span>Saved & Progress</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-white/5">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="btn-primary py-1.5 px-3.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              style={{
                boxShadow: '0 2px 12px rgba(99, 102, 241, 0.35)',
              }}
            >
              <UserIcon size={13} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
