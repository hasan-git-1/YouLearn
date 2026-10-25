'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface ProgressContextType {
  completedVideoIds: Set<string>;
  savedItemIds: Set<string>;
  isCompleted: (videoId: string) => boolean;
  isSaved: (contentId: string) => boolean;
  refreshProgress: () => Promise<void>;
  toggleCompleted: (videoId: string) => Promise<void>;
  toggleSaved: (contentId: string, contentType: 'video' | 'playlist') => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const LOCAL_COMPLETED_KEY = 'tubiq_completed_videos';
const LOCAL_SAVED_KEY = 'tubiq_saved_items';

function readLocalIds(key: string): Set<string> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(value) && value.every((id): id is string => typeof id === 'string')
      ? new Set(value)
      : new Set();
  } catch {
    return new Set();
  }
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const previousUserId = useRef<string | null>(null);
  const [completedVideoIds, setCompletedVideoIds] = useState<Set<string>>(() => new Set());
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(() => new Set());

  const refreshProgress = useCallback(async () => {
    if (!user) return;

    try {
      const [progressRes, savedRes] = await Promise.all([
        fetch('/api/user/progress'),
        fetch('/api/user/saved'),
      ]);

      if (!progressRes.ok || !savedRes.ok) {
        throw new Error(`Progress sync failed (${progressRes.status}, ${savedRes.status})`);
      }
      const progressData = await progressRes.json();
      const savedData = await savedRes.json();

      if (Array.isArray(progressData.completedIds)) {
        setCompletedVideoIds(new Set(progressData.completedIds));
        try {
          localStorage.setItem(LOCAL_COMPLETED_KEY, JSON.stringify(progressData.completedIds));
        } catch {}
      }

      if (Array.isArray(savedData.savedIds)) {
        setSavedItemIds(new Set(savedData.savedIds));
        try {
          localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(savedData.savedIds));
        } catch {}
      }
    } catch (error) {
      console.error('[ProgressContext] Failed to refresh progress:', error);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      const wasSignedIn = previousUserId.current !== null;
      previousUserId.current = null;
      if (wasSignedIn) {
        try {
          localStorage.removeItem(LOCAL_COMPLETED_KEY);
          localStorage.removeItem(LOCAL_SAVED_KEY);
        } catch {}
      }
      const timeoutId = window.setTimeout(() => {
        if (wasSignedIn) {
          setCompletedVideoIds(new Set());
          setSavedItemIds(new Set());
        } else {
          setCompletedVideoIds(readLocalIds(LOCAL_COMPLETED_KEY));
          setSavedItemIds(readLocalIds(LOCAL_SAVED_KEY));
        }
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    previousUserId.current = user.id;
    const timeoutId = window.setTimeout(() => void refreshProgress(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [isAuthLoading, user, refreshProgress]);

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
          const response = await fetch('/api/user/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId }),
          });
          if (!response.ok) throw new Error(`Progress update failed (${response.status})`);
          await refreshProgress();
        } catch (e) {
          console.error('[ProgressContext] Failed to sync progress:', e);
        }
      }
    },
    [user, refreshProgress]
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
          const response = await fetch('/api/user/saved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contentId, contentType }),
          });
          if (!response.ok) throw new Error(`Bookmark update failed (${response.status})`);
          await refreshProgress();
        } catch (e) {
          console.error('[ProgressContext] Failed to sync bookmark:', e);
        }
      }
    },
    [user, refreshProgress]
  );

  return (
    <ProgressContext.Provider
      value={{
        completedVideoIds,
        savedItemIds,
        isCompleted,
        isSaved,
        refreshProgress,
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
