'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface ProgressContextType {
  completedVideoIds: Set<string>;
  savedItemIds: Set<string>;
  isCompleted: (videoId: string) => boolean;
  isSaved: (contentId: string) => boolean;
  toggleCompleted: (videoId: string) => Promise<void>;
  toggleSaved: (contentId: string, contentType: 'video' | 'playlist') => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const LOCAL_COMPLETED_KEY = 'youlearn_completed_videos';
const LOCAL_SAVED_KEY = 'youlearn_saved_items';

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [completedVideoIds, setCompletedVideoIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem(LOCAL_COMPLETED_KEY);
        if (local) return new Set(JSON.parse(local));
      } catch {}
    }
    return new Set();
  });

  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem(LOCAL_SAVED_KEY);
        if (local) return new Set(JSON.parse(local));
      } catch {}
    }
    return new Set();
  });

  // Fetch server-synced progress if user is authenticated
  useEffect(() => {
    if (!user) return;

    // Fetch user progress from server
    fetch('/api/user/progress')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.completedIds)) {
          setCompletedVideoIds(new Set(data.completedIds));
        }
      })
      .catch(() => {});

    // Fetch saved items from server
    fetch('/api/user/saved')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.savedIds)) {
          setSavedItemIds(new Set(data.savedIds));
        }
      })
      .catch(() => {});
  }, [user]);

  const isCompleted = useCallback(
    (videoId: string) => completedVideoIds.has(videoId),
    [completedVideoIds]
  );

  const isSaved = useCallback(
    (contentId: string) => savedItemIds.has(contentId),
    [savedItemIds]
  );

  const toggleCompleted = useCallback(
    async (videoId: string) => {
      setCompletedVideoIds((prev) => {
        const next = new Set(prev);
        if (next.has(videoId)) {
          next.delete(videoId);
        } else {
          next.add(videoId);
        }
        try {
          localStorage.setItem(LOCAL_COMPLETED_KEY, JSON.stringify(Array.from(next)));
        } catch {}
        return next;
      });

      if (user) {
        try {
          await fetch('/api/user/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId }),
          });
        } catch (e) {
          console.error('[ProgressContext] Failed to sync progress:', e);
        }
      }
    },
    [user]
  );

  const toggleSaved = useCallback(
    async (contentId: string, contentType: 'video' | 'playlist') => {
      setSavedItemIds((prev) => {
        const next = new Set(prev);
        if (next.has(contentId)) {
          next.delete(contentId);
        } else {
          next.add(contentId);
        }
        try {
          localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(Array.from(next)));
        } catch {}
        return next;
      });

      if (user) {
        try {
          await fetch('/api/user/saved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contentId, contentType }),
          });
        } catch (e) {
          console.error('[ProgressContext] Failed to sync bookmark:', e);
        }
      }
    },
    [user]
  );

  return (
    <ProgressContext.Provider
      value={{
        completedVideoIds,
        savedItemIds,
        isCompleted,
        isSaved,
        toggleCompleted,
        toggleSaved,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
