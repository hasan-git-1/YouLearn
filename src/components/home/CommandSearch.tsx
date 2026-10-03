'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  Video,
  Mic,
  Compass,
  Terminal,
  Network,
  Layers,
  TrendingUp,
  Search
} from 'lucide-react';

interface Suggestion {
  query: string;
  tag: string;
  type: 'course' | 'path' | 'podcast' | 'deepdive';
  icon: React.ReactNode;
}

const INTELLIGENT_SUGGESTIONS: Suggestion[] = [
  {
    query: 'Learn React from beginner to advanced',
    tag: 'Curated Path',
    type: 'course',
    icon: <BookOpen size={13} className="text-violet-400" />,
  },
  {
    query: 'System design roadmap for senior engineers',
    tag: 'Architecture',
    type: 'path',
    icon: <Compass size={13} className="text-cyan-400" />,
  },
  {
    query: 'AI engineering fundamentals & RAG',
    tag: 'LLMs & Agents',
    type: 'deepdive',
    icon: <Sparkles size={13} className="text-indigo-400" />,
  },
  {
    query: 'Best Python courses & practical projects',
    tag: 'Hands-on',
    type: 'course',
    icon: <Video size={13} className="text-emerald-400" />,
  },
  {
    query: 'Learn stock market basics & technical analysis',
    tag: 'Finance',
    type: 'podcast',
    icon: <Mic size={13} className="text-amber-400" />,
  },
];

const TOPIC_CAPSULES = [
  { label: 'System Design', icon: <Network size={12} className="text-indigo-400" /> },
  { label: 'React', icon: <span className="text-cyan-400 text-xs">⚛</span> },
  { label: 'AI Engineering', icon: <Sparkles size={12} className="text-violet-400" /> },
  { label: 'Python', icon: <Terminal size={12} className="text-emerald-400" /> },
  { label: 'Full Stack', icon: <Layers size={12} className="text-cyan-400" /> },
  { label: 'Stock Market', icon: <TrendingUp size={12} className="text-emerald-400" /> },
];

interface CommandSearchProps {
  onQueryChange?: (q: string) => void;
}

export function CommandSearch({ onQueryChange }: CommandSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (val: string) => {
    setQuery(val);
    onQueryChange?.(val);
  };

  const handleSelectTopic = (topic: string) => {
    setQuery(topic);
    onQueryChange?.(topic);
    inputRef.current?.focus();
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
      if (selectedIndex >= 0 && selectedIndex < INTELLIGENT_SUGGESTIONS.length) {
        executeSearch(INTELLIGENT_SUGGESTIONS[selectedIndex].query);
      } else {
        executeSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < INTELLIGENT_SUGGESTIONS.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : INTELLIGENT_SUGGESTIONS.length - 1));
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  return (
    <div className="w-full max-w-2xl mx-auto relative select-none" ref={containerRef}>
      {/* ── Main Command Search Box (Pill Shape with Electric Violet Glow) ── */}
      <motion.div
        animate={{
          scale: isFocused ? 1.012 : 1,
          boxShadow: isFocused
            ? '0 12px 48px rgba(99, 102, 241, 0.35), 0 0 0 1.5px rgba(99, 102, 241, 0.7)'
            : '0 8px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(99, 102, 241, 0.20), 0 0 0 1px rgba(99, 102, 241, 0.35)',
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
        className={`relative group cursor-text transition-all duration-300 ${
          isFocused ? 'rounded-3xl' : 'rounded-full'
        }`}
        style={{
          background: isFocused
            ? 'linear-gradient(135deg, rgba(16, 20, 42, 0.96), rgba(10, 13, 28, 0.98))'
            : 'linear-gradient(135deg, rgba(12, 16, 34, 0.88), rgba(8, 10, 22, 0.92))',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="relative flex items-center px-4 py-2.5 sm:px-6 sm:py-3 gap-3">
          {/* Search Glyph */}
          <div className="flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors flex-shrink-0">
            <Search size={18} />
          </div>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to learn?"
            className="w-full bg-transparent text-white placeholder-gray-400 text-sm sm:text-base outline-none font-normal"
            style={{ fontFamily: 'var(--font-sans)' }}
            autoComplete="off"
            spellCheck={false}
          />

          {/* Keyboard shortcut hint */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono text-gray-400">
            <span>⌘</span>
            <span>K</span>
          </div>

          {/* Animated Circular Purple Action Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={(e) => {
              e.stopPropagation();
              executeSearch();
            }}
            aria-label="Search"
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 text-white cursor-pointer relative overflow-hidden transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 18px rgba(99, 102, 241, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <ArrowRight size={17} className="text-white group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        </div>

        {/* ── Intelligent Suggestions Dropdown ────────────────────────── */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }}
              className="border-t border-white/10 px-3 py-3 overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-1 text-[11px] font-mono uppercase text-indigo-400/80">
                <span className="flex items-center gap-1.5">
                  <Terminal size={11} />
                  Intelligent Suggestions
                </span>
                <span className="text-gray-400">↑↓ to navigate · Enter to select</span>
              </div>

              <div className="mt-1 space-y-1">
                {INTELLIGENT_SUGGESTIONS.map((s, idx) => (
                  <motion.div
                    key={s.query}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.035, duration: 0.2 }}
                    onClick={() => {
                      setQuery(s.query);
                      executeSearch(s.query);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
                      selectedIndex === idx
                        ? 'bg-indigo-600/30 text-white border border-indigo-500/40'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-5 h-5 rounded-md bg-white/5">
                        {s.icon}
                      </div>
                      <span className="font-medium">{s.query}</span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
                      {s.tag}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Premium Clean Topic Capsules (Matching Mockup) ──────────────── */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mt-5">
        {TOPIC_CAPSULES.map((topic) => {
          const isSelected = query.toLowerCase() === topic.label.toLowerCase();
          return (
            <motion.button
              key={topic.label}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelectTopic(topic.label)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? 'bg-indigo-500/25 text-indigo-300 border-indigo-400 shadow-[0_0_16px_rgba(99,102,241,0.35)]'
                  : 'bg-white/[0.04] text-gray-300 border-white/10 hover:border-indigo-500/40 hover:text-white hover:bg-white/[0.08] hover:shadow-[0_0_14px_rgba(99,102,241,0.22)]'
              }`}
            >
              <span>{topic.icon}</span>
              <span>{topic.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
