'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowRight,
  Network,
  Sparkles,
  Terminal,
  Layers,
  TrendingUp,
} from 'lucide-react';

const TOPIC_CHIPS = [
  { label: 'System Design', icon: <Network size={12} className="text-indigo-400" /> },
  { label: 'React', icon: <span className="text-cyan-400 text-xs leading-none">⚛</span> },
  { label: 'AI Engineering', icon: <Sparkles size={12} className="text-violet-400" /> },
  { label: 'Python', icon: <Terminal size={12} className="text-emerald-400" /> },
  { label: 'Full Stack', icon: <Layers size={12} className="text-cyan-400" /> },
  { label: 'Stock Market', icon: <TrendingUp size={12} className="text-amber-400" /> },
];

interface CommandSearchProps {
  onQueryChange?: (q: string) => void;
}

export function CommandSearch({ onQueryChange }: CommandSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (val: string) => {
    setQuery(val);
    onQueryChange?.(val);
  };

  const executeSearch = useCallback(
    (searchVal?: string) => {
      const target = (searchVal ?? query).trim();
      if (target.length >= 2) {
        router.push(`/search?q=${encodeURIComponent(target)}`);
      }
    },
    [query, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
      setIsFocused(false);
    }
  };

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const easeCurve = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none px-2">
      {/* ── Core Intelligence Command Search Interface ────────────────── */}
      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55, ease: easeCurve }}
        onSubmit={(e) => {
          e.preventDefault();
          executeSearch();
        }}
        className="w-full group cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <motion.div
          animate={{
            y: isFocused ? -1.5 : 0,
            borderColor: isFocused
              ? 'rgba(129, 140, 248, 0.75)'
              : 'rgba(255, 255, 255, 0.12)',
            boxShadow: isFocused
              ? '0 16px 44px rgba(0, 0, 0, 0.75), 0 0 36px rgba(99, 102, 241, 0.38)'
              : '0 10px 32px rgba(0, 0, 0, 0.55), 0 0 22px rgba(99, 102, 241, 0.16)',
          }}
          whileHover={{
            borderColor: isFocused
              ? 'rgba(129, 140, 248, 0.85)'
              : 'rgba(99, 102, 241, 0.45)',
            boxShadow: isFocused
              ? '0 18px 48px rgba(0, 0, 0, 0.8), 0 0 42px rgba(99, 102, 241, 0.42)'
              : '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 28px rgba(99, 102, 241, 0.24)',
          }}
          transition={{ duration: 0.2, ease: easeCurve }}
          className="relative flex items-center px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-full border transition-colors duration-200"
          style={{
            background: 'rgba(9, 12, 26, 0.88)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
          }}
        >
          {/* Left: Search Glyph */}
          <div className="flex items-center justify-center text-gray-400 group-hover:text-indigo-400 transition-colors flex-shrink-0 mr-3">
            <Search size={18} />
          </div>

          {/* Center: Search Input */}
          <input
            id="hero-search-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to learn?"
            className="w-full bg-transparent text-white placeholder-gray-400 text-sm sm:text-base outline-none font-normal tracking-tight"
            style={{ fontFamily: 'var(--font-sans)' }}
            autoComplete="off"
            spellCheck={false}
          />

          {/* Right: Keyboard Shortcut Hint */}
          <div className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.04] text-[10px] font-mono text-gray-400 mr-2 flex-shrink-0">
            <span>⌘</span>
            <span>K</span>
          </div>

          {/* Right: Circular Action Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Submit Search"
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 text-white cursor-pointer relative overflow-hidden transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.55)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <ArrowRight size={16} className="text-white group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        </motion.div>
      </motion.form>

      {/* ── Topic Chips: Single Clean Aligned Row ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.7, ease: easeCurve }}
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-4.5"
      >
        {TOPIC_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => executeSearch(chip.label)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-gray-300 border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:text-white hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:shadow-[0_0_14px_rgba(99,102,241,0.2)] cursor-pointer"
          >
            <span className="flex items-center justify-center">{chip.icon}</span>
            <span>{chip.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
