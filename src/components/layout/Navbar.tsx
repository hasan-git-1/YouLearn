'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { Search, BookOpen, Bookmark, User as UserIcon, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function NavbarSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);

  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

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

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-2">
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
          placeholder="What do you want to learn?"
          className="input-base pl-10 pr-4 py-2 text-sm w-full"
          style={{ borderRadius: 'var(--radius-md)' }}
          autoComplete="off"
        />
      </div>
    </form>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { user, openAuthModal, signOut } = useAuth();
  const isHomePage = pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track scroll position on homepage to transform transparent nav to floating glass
  useEffect(() => {
    if (!isHomePage) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

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

  const isTransparent = isHomePage && !scrolled;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent border-b border-transparent'
          : 'bg-[#080b14]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
      }`}
    >
      <div
        className="mx-auto flex items-center justify-between gap-4 px-4 py-3"
        style={{ maxWidth: '1280px' }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0 group"
          style={{ textDecoration: 'none' }}
        >
          <div
            className="flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
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

        {/* Search bar — hidden on homepage (hero command search serves that role) */}
        {!isHomePage ? (
          <Suspense fallback={<div className="flex-1 max-w-xl mx-2" />}>
            <NavbarSearchInput />
          </Suspense>
        ) : (
          <div className="flex-1" />
        )}

        {/* Center / Right Nav / User Controls */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link
            href="/topics"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            style={{ textDecoration: 'none' }}
          >
            <span>Explore Topics</span>
          </Link>

          <Link
            href="/library"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
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
