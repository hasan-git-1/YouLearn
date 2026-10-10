'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { Search, BookOpen, Bookmark, User as UserIcon, LogOut, Sparkles, Menu, X } from 'lucide-react';
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
    <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
      <div className="relative flex items-center">
        <Search
          size={14}
          className="absolute left-3.5 pointer-events-none text-gray-400"
        />
        <input
          id="navbar-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses, videos, creators..."
          className="w-full pl-9 pr-4 py-1.5 rounded-full text-xs bg-white/[0.05] border border-white/10 text-white placeholder-gray-400 outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition-all"
          autoComplete="off"
        />
      </div>
    </form>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, openAuthModal, signOut } = useAuth();
  const isHomePage = pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    if (isHomePage) {
      const input = document.getElementById('hero-search-input') as HTMLInputElement | null;
      if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
        return;
      }
    }
    router.push('/search');
  };

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isHomePage && !scrolled
          ? 'border-b border-white/[0.04] bg-[#050711]/25 backdrop-blur-md'
          : 'border-b border-white/[0.08] bg-[#060813]/85 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl'
      }`}
    >
      <div
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-12"
      >
        {/* Left: Tubiq Logo + Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0 group"
          style={{ textDecoration: 'none' }}
        >
            <div
              className="flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
            style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 14px rgba(99, 102, 241, 0.45)',
            }}
          >
            <BookOpen size={16} color="white" strokeWidth={2.5} />
          </div>
          <span
            className="font-black text-lg tracking-tight text-white group-hover:text-indigo-200 transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Tubiq
          </span>
        </Link>

        {/* Center: destination navigation on the homepage, search on inner pages */}
        {isHomePage ? (
          <div className="hidden rounded-full border border-white/[0.08] bg-white/[0.045] p-1 md:flex md:items-center">
            <Link
              href="/#explore"
              className="rounded-full px-4 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/[0.07] hover:text-white"
              style={{ textDecoration: 'none' }}
            >
              Explore Topics
            </Link>
            <Link
              href="/#how-it-works"
              className="rounded-full px-4 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/[0.07] hover:text-white"
              style={{ textDecoration: 'none' }}
            >
              How It Works
            </Link>
          </div>
        ) : (
          <div className="flex-1 max-w-md hidden sm:block">
            <Suspense fallback={<div className="h-8" />}>
              <NavbarSearchInput />
            </Suspense>
          </div>
        )}

        {/* Right: Search Icon + Sign In Button */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {/* Search Icon Trigger */}
          <button
            onClick={handleSearchClick}
            aria-label="Search"
            className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-all hover:bg-white/[0.08] hover:text-white sm:flex"
          >
            <Search size={16} />
          </button>

          <Link href="/library" className="hidden rounded-full px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/[0.07] hover:text-white sm:inline-flex" style={{ textDecoration: 'none' }}>
            My Library
          </Link>

          {/* User Profile or Sign In Button */}
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
                    background: 'rgba(12, 16, 32, 0.96)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(24px)',
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
                      <span>Saved &amp; Progress</span>
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
              className="hidden cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-95 sm:flex"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 0 16px rgba(99, 102, 241, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <UserIcon size={12} />
              <span>Sign In</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-white transition-colors hover:bg-white/[0.1] md:hidden"
          >
            {isMobileMenuOpen ? <X size={17} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="border-t border-white/[0.07] bg-[#080b18]/95 px-5 py-4 backdrop-blur-2xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <Link href="/#explore" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm text-gray-200 hover:bg-white/[0.06]">Explore Topics</Link>
            <Link href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm text-gray-200 hover:bg-white/[0.06]">How It Works</Link>
            <Link href="/library" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm text-gray-200 hover:bg-white/[0.06]">My Library</Link>
            {!user && <button onClick={() => { setIsMobileMenuOpen(false); openAuthModal(); }} className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2.5 text-sm font-semibold text-white"><UserIcon size={14} /> Sign In</button>}
          </div>
        </div>
      )}
    </nav>
  );
}
