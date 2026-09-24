'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  CheckCircle2,
  GraduationCap,
  Video,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/context/ProgressContext';
import { VideoCard } from '@/components/cards/VideoCard';
import { CourseCard } from '@/components/cards/CourseCard';
import type { Video as VideoType, Playlist } from '@/types';

export default function LibraryPage() {
  const { user, openAuthModal } = useAuth();
  const { completedVideoIds, savedItemIds } = useProgress();
  const [activeTab, setActiveTab] = useState<'saved' | 'completed'>('saved');
  const [savedVideos, setSavedVideos] = useState<VideoType[]>([]);
  const [savedCourses, setSavedCourses] = useState<Playlist[]>([]);

  useEffect(() => {
    fetch('/api/user/saved')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.videos)) setSavedVideos(data.videos);
        if (Array.isArray(data.courses)) setSavedCourses(data.courses);
      })
      .catch(() => {});
  }, [user]);

  const totalSavedCount = savedItemIds.size;
  const totalCompletedCount = completedVideoIds.size;

  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* Header */}
      <section
        className="px-4 py-12 text-center bg-grid bg-radial-glow relative overflow-hidden"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
            >
              <Bookmark size={16} className="text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Personal Learning Hub
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-black text-white mb-3"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            My <span className="gradient-text">Library & Progress</span>
          </h1>

          <p className="text-sm text-gray-300 max-w-md mx-auto mb-6">
            Keep track of courses you’ve bookmarked, watch history, and learning milestones.
          </p>

          {/* Stats bar */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            <div
              className="px-4 py-2.5 rounded-2xl glass-card text-center"
              style={{ minWidth: 120 }}
            >
              <span className="block text-2xl font-black text-indigo-400">
                {totalSavedCount}
              </span>
              <span className="text-[11px] text-gray-400">Saved Resources</span>
            </div>

            <div
              className="px-4 py-2.5 rounded-2xl glass-card text-center"
              style={{ minWidth: 120 }}
            >
              <span className="block text-2xl font-black text-emerald-400">
                {totalCompletedCount}
              </span>
              <span className="text-[11px] text-gray-400">Lessons Finished</span>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Banner if not signed in */}
      {!user && (
        <div className="px-4 pt-6" style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  Sync your progress across devices
                </p>
                <p className="text-xs text-gray-300">
                  Currently saving locally. Sign in to back up your completions to the cloud.
                </p>
              </div>
            </div>

            <button
              onClick={openAuthModal}
              className="btn-primary py-2 px-4 text-xs font-semibold shrink-0 cursor-pointer"
              style={{ boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)' }}
            >
              Sign In / Register
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="px-4 py-8" style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-8">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark size={14} />
            <span>Saved Content ({totalSavedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>Completed ({totalCompletedCount})</span>
          </button>
        </div>

        {/* Tab 1: Saved Content */}
        {activeTab === 'saved' && (
          <div>
            {totalSavedCount === 0 ? (
              <div className="text-center py-16 animate-fade-up">
                <div
                  className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                  <Bookmark size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No saved items yet</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
                  Bookmark courses or videos while browsing topics to build your customized curriculum.
                </p>
                <Link href="/topics" className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-5">
                  <span>Explore Topics</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Saved Courses */}
                {savedCourses.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <GraduationCap size={16} className="text-indigo-400" />
                      <span>Saved Courses ({savedCourses.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {savedCourses.map((c) => (
                        <CourseCard key={c.id} course={c} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Saved Videos */}
                {savedVideos.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <Video size={16} className="text-cyan-400" />
                      <span>Saved Videos ({savedVideos.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {savedVideos.map((v) => (
                        <VideoCard key={v.id} video={v} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Completed Lessons */}
        {activeTab === 'completed' && (
          <div>
            {totalCompletedCount === 0 ? (
              <div className="text-center py-16 animate-fade-up">
                <div
                  className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-4"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                >
                  <CheckCircle2 size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No completed lessons yet</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
                  Mark videos and course chapters as finished to track your learning journey over time.
                </p>
                <Link href="/search" className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-5">
                  <span>Start Learning</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Completed Lessons Milestone
                    </h3>
                    <p className="text-xs text-gray-400">
                      You have completed {totalCompletedCount} educational lessons on Tubiq. Keep up the momentum!
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={18} className="text-emerald-400" />
                    <div>
                      <p className="text-xs font-semibold text-white">Daily Learning Goal</p>
                      <p className="text-[11px] text-gray-400">Track your daily streak by finishing lessons consistently.</p>
                    </div>
                  </div>
                  <Link href="/topics" className="btn-ghost text-xs py-1.5 px-3">
                    Browse More →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
