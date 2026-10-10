'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithPassword, signUpWithPassword } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (tab === 'signin') {
        const res = await signInWithPassword(cleanEmail, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setEmail('');
          setPassword('');
          closeAuthModal();
        }
      } else {
        const res = await signUpWithPassword(cleanEmail, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setEmail('');
          setPassword('');
          closeAuthModal();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            background: 'rgba(5, 7, 15, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAuthModal();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 overflow-hidden animate-fade-up shadow-2xl"
              style={{
                background: 'linear-gradient(145deg, rgba(16, 20, 42, 0.96) 0%, rgba(9, 12, 26, 0.98) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 24px 60px -10px rgba(0, 0, 0, 0.85), 0 0 35px -5px rgba(99, 102, 241, 0.25)',
              }}
            >
        {/* Subtle Ambient Glow */}
        <div
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, #a855f7 100%)' }}
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
            Tubiq Account
          </span>
        </div>

        <h2
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {tab === 'signin' ? 'Welcome Back' : 'Create Free Account'}
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          {tab === 'signin'
            ? 'Sign in to access your saved courses, bookmarks, and learning progress.'
            : 'Get instant access with your email and password — zero waiting or confirmation required.'}
        </p>

        {/* Tabs */}
        <div
          className="flex p-1 rounded-xl mb-6"
          style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tab === 'signin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tab === 'signup'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-300">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={15} className="absolute left-3.5 text-gray-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-base pl-10 pr-4 py-2.5 text-sm w-full"
                style={{ borderRadius: 'var(--radius-md)' }}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-gray-400 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base pl-10 pr-4 py-2.5 text-sm w-full"
                style={{ borderRadius: 'var(--radius-md)' }}
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 mt-6 cursor-pointer"
            style={{
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{tab === 'signin' ? 'Sign In' : 'Create Account & Sign In'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
