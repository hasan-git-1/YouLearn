import React from 'react';
import Link from 'next/link';
import { Route, Clock, Play, GraduationCap } from 'lucide-react';
import type { AILearningPath, Video, Playlist } from '@/types';

interface AILearningPathViewProps {
  learningPath: AILearningPath;
  videosById?: Record<string, Video>;
  coursesById?: Record<string, Playlist>;
}

export function AILearningPathView({
  learningPath,
  videosById = {},
  coursesById = {},
}: AILearningPathViewProps) {
  if (!learningPath.levels || learningPath.levels.length === 0) {
    return null;
  }

  return (
    <div className="mb-14">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)',
          }}
        >
          <Route size={18} className="text-white" />
        </div>
        <div>
          <h2
            className="text-xl font-bold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Structured Learning Path
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            AI-sequenced roadmap from indexed database resources
          </p>
        </div>
      </div>

      {/* Levels list */}
      <div className="space-y-4">
        {learningPath.levels.map((lvl) => {
          const course = lvl.recommended_course_id ? coursesById[lvl.recommended_course_id] : null;
          const levelVideos = lvl.recommended_video_ids
            .map((id) => videosById[id])
            .filter((v): v is Video => Boolean(v));

          return (
            <div
              key={lvl.level}
              className="glass-card rounded-2xl p-5 sm:p-6 transition-all hover:border-indigo-500/30"
              style={{
                background: 'rgba(15, 18, 35, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-black tracking-wider uppercase"
                    style={{
                      background: 'rgba(99, 102, 241, 0.2)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      color: '#a5b4fc',
                    }}
                  >
                    Level {lvl.level}
                  </span>
                  <h3 className="text-base font-bold text-white">{lvl.title}</h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock size={13} />
                  <span>Est. ~{lvl.estimated_hours} hrs</span>
                </div>
              </div>

              {/* Concepts */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {lvl.concepts.map((concept, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full text-gray-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {concept}
                  </span>
                ))}
              </div>

              {/* Associated resources */}
              {(course || levelVideos.length > 0) && (
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Recommended Resources:
                  </p>

                  {course && (
                    <Link
                      href={`/courses/${course.id}`}
                      className="flex items-center justify-between p-2.5 rounded-xl text-xs text-white hover:bg-white/5 transition-colors group"
                      style={{
                        background: 'rgba(99, 102, 241, 0.08)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <GraduationCap size={15} className="text-indigo-400 shrink-0" />
                        <span className="truncate font-medium">{course.title}</span>
                      </div>
                      <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                        View Course →
                      </span>
                    </Link>
                  )}

                  {levelVideos.map((v) => (
                    <Link
                      key={v.id}
                      href={`/videos/${v.id}`}
                      className="flex items-center justify-between p-2.5 rounded-xl text-xs text-white hover:bg-white/5 transition-colors group"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Play size={14} className="text-cyan-400 shrink-0" />
                        <span className="truncate font-medium">{v.title}</span>
                      </div>
                      <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                        Watch Video →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
