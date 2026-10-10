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

const TOPIC_CHIPS: { label: string; icon: () => React.ReactNode }[] = [
  { label: 'System Design', icon: () => <Network size={12} className="text-indigo-400" /> },
  { label: 'React', icon: () => <span className="text-cyan-400 text-xs leading-none">⚛</span> },
  { label: 'AI Engineering', icon: () => <Sparkles size={12} className="text-violet-400" /> },
  { label: 'Python', icon: () => <Terminal size={12} className="text-emerald-400" /> },
  { label: 'Full Stack', icon: () => <Layers size={12} className="text-cyan-400" /> },
  { label: 'Stock Market', icon: () => <TrendingUp size={12} className="text-amber-400" /> },
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
    <div className="w-full max-w-[39rem] flex flex-col items-start">
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
              ? 'rgba(251, 191, 36, 0.85)'
              : 'rgba(255, 204, 128, 0.16)',
            boxShadow: isFocused
              ? '0 16px 44px rgba(0, 0, 0, 0.7), 0 0 34px rgba(245, 158, 11, 0.32)'
              : '0 10px 32px rgba(0, 0, 0, 0.55), 0 0 24px rgba(245, 158, 11, 0.14)',
          }}
          whileHover={{
            borderColor: isFocused
              ? 'rgba(251, 191, 36, 0.92)'
              : 'rgba(251, 191, 36, 0.4)',
            boxShadow: isFocused
              ? '0 18px 48px rgba(0, 0, 0, 0.8), 0 0 38px rgba(245, 158, 11, 0.38)'
              : '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 28px rgba(245, 158, 11, 0.2)',
          }}
          transition={{ duration: 0.2, ease: easeCurve }}
          className="relative flex items-center px-4 py-2.5 sm:px-5 sm:py-3 rounded-[1.15rem] border transition-colors duration-200"
          style={{
            background: 'rgba(26, 17, 12, 0.86)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
          }}
        >
          {/* Left: Search Glyph */}
          <div className="flex items-center justify-center text-[#f1c27d] group-hover:text-[#f8d79d] transition-colors flex-shrink-0 mr-3">
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
            className="w-full bg-transparent text-[#fff7ed] placeholder-[#d9a96b] text-sm sm:text-base outline-none font-normal tracking-tight"
            style={{ fontFamily: 'var(--font-sans)' }}
            autoComplete="off"
            spellCheck={false}
          />

          {/* Right: Keyboard Shortcut Hint */}
          <div className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded-md border border-[#f8c784]/15 bg-[#f59e0b]/5 text-[10px] font-mono text-[#f5d4a6] mr-2 flex-shrink-0">
            <span>⌘</span>
            <span>K</span>
          </div>

          {/* Right: Circular Action Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Submit Search"
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 text-[#1a120d] cursor-pointer relative overflow-hidden transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 52%, #fbbf24 100%)',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.45)',
              border: '1px solid rgba(255, 229, 168, 0.25)',
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
        className="flex flex-wrap items-center justify-start gap-2 mt-4"
      >
        {TOPIC_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => executeSearch(chip.label)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-[#f7d9b6] border border-[#f8c784]/15 bg-[#2a1b12]/55 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:text-[#fff7ed] hover:border-[#f5b84d]/45 hover:bg-[#f59e0b]/10 hover:shadow-[0_0_14px_rgba(245,158,11,0.15)] cursor-pointer"
          >
            <span className="flex items-center justify-center">{chip.icon()}</span>
            <span>{chip.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
