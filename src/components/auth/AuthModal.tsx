'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithPassword, signUpWithPassword } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (tab === 'signin') {
        const res = await signInWithPassword(email.trim(), password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setEmail('');
          setPassword('');
        }
      } else {
        const res = await signUpWithPassword(email.trim(), password);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.message) {
          setSuccessMsg(res.message);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(5, 7, 15, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 overflow-hidden animate-fade-up shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(20, 24, 45, 0.95) 0%, rgba(10, 13, 28, 0.98) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.8), 0 0 30px -5px rgba(99, 102, 241, 0.25)',
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, #a855f7 100%)' }}
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
          >
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Tubiq Account
          </span>
        </div>

        <h2
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {tab === 'signin' ? 'Welcome Back' : 'Start Your Learning Journey'}
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          {tab === 'signin'
            ? 'Sign in to sync your progress, saved courses, and personalized paths.'
            : 'Create a free account to track video completion and save custom curricula.'}
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
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
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
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'signup'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-300">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-xl text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-base pl-9 pr-4 py-2.5 text-sm w-full"
                style={{ borderRadius: 'var(--radius-md)' }}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base pl-9 pr-4 py-2.5 text-sm w-full"
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
                <span>{tab === 'signin' ? 'Sign In' : 'Create Free Account'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
