'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';
import { LoaderCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TOPICS } from '@/config/topics';
import { useMagneticMotion } from '@/lib/motion';

const POPULAR_SUGGESTIONS = TOPICS.map((topic) => topic.name);

interface SearchBarProps {
  placeholder?: string;
  size?: 'hero' | 'default';
  initialValue?: string;
  autofocus?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search any topic…',
  size = 'default',
  initialValue = '',
  autofocus = false,
  onSearch,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const submitMotion = useMagneticMotion<HTMLButtonElement>();

  useEffect(() => {
    if (autofocus) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autofocus]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = query.trim();
      if (q.length < 2) return;
      setIsSearching(true);
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(q);
      } else {
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }
    },
    [query, router, onSearch]
  );

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      setQuery(suggestion);
      setIsSearching(true);
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(suggestion);
      } else {
        router.push(`/search?q=${encodeURIComponent(suggestion)}`);
      }
    },
    [router, onSearch]
  );

  const isHero = size === 'hero';
  const filteredSuggestions = query.trim().length > 0
    ? POPULAR_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      )
    : POPULAR_SUGGESTIONS.slice(0, 5);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit}>
        <div
          className="relative flex items-center transition-all duration-200"
          style={{
            background: 'var(--bg-elevated)',
            border: `1px solid ${focused ? 'var(--brand-primary)' : 'var(--border-default)'}`,
            borderRadius: isHero ? 16 : 12,
            boxShadow: focused
              ? '0 0 0 3px rgba(99,102,241,0.15), 0 8px 32px rgba(0,0,0,0.3)'
              : '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          {/* Search icon */}
          <Search
            size={isHero ? 20 : 16}
            className="absolute flex-shrink-0"
            style={{
              left: isHero ? 20 : 14,
              color: focused ? 'var(--brand-primary)' : 'var(--text-muted)',
              transition: 'color 0.2s',
            }}
          />

          {/* Input */}
          <input
            id="main-search"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsSearching(false);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              setFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowSuggestions(false);
                inputRef.current?.blur();
              }
            }}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent outline-none font-medium"
            style={{
              padding: isHero ? '18px 60px 18px 52px' : '12px 52px 12px 42px',
              fontSize: isHero ? 17 : 15,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
            }}
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute flex items-center justify-center rounded-full transition-all hover:opacity-70"
              style={{
                right: isHero ? 60 : 48,
                width: 24,
                height: 24,
                background: 'var(--border-default)',
                color: 'var(--text-muted)',
              }}
            >
              <X size={12} />
            </button>
          )}

          {/* Submit button */}
          <motion.button
            {...submitMotion}
            type="submit"
            id="search-submit-btn"
            aria-label={isSearching ? 'Searching' : 'Submit Search'}
            aria-busy={isSearching}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="absolute flex items-center justify-center rounded-xl transition-all"
            style={{
              ...submitMotion.style,
              right: isHero ? 12 : 8,
              width: isHero ? 44 : 32,
              height: isHero ? 44 : 32,
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              color: 'white',
              boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
            }}
          >
            {isSearching ? <LoaderCircle size={isHero ? 18 : 14} className="animate-spin" /> : <ArrowRight size={isHero ? 18 : 14} strokeWidth={2.5} />}
          </motion.button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          className="absolute z-50 w-full mt-2 overflow-hidden"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          <div className="py-2">
            <p
              className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              {query.trim() ? 'Suggestions' : 'Popular topics'}
            </p>
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onMouseDown={() => handleSuggestion(suggestion)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }}
              >
                <Search size={14} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                <span className="text-sm">{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
