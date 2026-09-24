'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getAuthErrorMessage(error: AuthError | Error | unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as AuthError).message;
    
    // Common Supabase auth error messages
    if (message.includes('Invalid login credentials') || message.includes('Invalid email or password')) {
      return 'Invalid email or password. Please check your credentials.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (message.includes('Too many requests') || message.includes('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (message.includes('User already registered') || message.includes('already been registered')) {
      return 'An account with this email already exists. Try signing in instead.';
    }
    if (message.includes('Password should be at least')) {
      return 'Password is too short. Please use at least 6 characters.';
    }
    if (message.includes('Invalid email')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('signup disabled') || message.includes('Signups not allowed')) {
      return 'Sign up is currently disabled. Please contact support.';
    }
    
    return message;
  }
  return 'An unexpected error occurred. Please try again.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: getAuthErrorMessage(error) };
        setIsAuthModalOpen(false);
        return {};
      } catch (e: unknown) {
        return { error: getAuthErrorMessage(e) };
      }
    },
    [supabase]
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: getAuthErrorMessage(error) };
        if (data?.session) {
          setIsAuthModalOpen(false);
        }
        // Check if email confirmation is required
        const needsConfirmation = data?.user && !data?.session;
        if (needsConfirmation) {
          return { message: 'Account created! Please check your email to confirm your account.' };
        }
        return { message: 'Account created successfully!' };
      } catch (e: unknown) {
        return { error: getAuthErrorMessage(e) };
      }
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithPassword,
        signUpWithPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
