/**
 * YouLearn — Query Intent Classifier (Phase 1B)
 *
 * Implements the intent → category ranking rules from spec section 5.
 * Pure deterministic logic — no LLM, no DB calls.
 * Returns which categories to show and in what order.
 */

import type { IntentClassification, QueryIntent } from '@/types';

// ─── Intent signal keyword sets ───────────────────────────────────────────────

const CAREER_KEYWORDS = [
  /\bcareer\b/i, /\bjob\b/i, /\bjobs\b/i, /\bsalary\b/i, /\binterview\b/i,
  /\bhiring\b/i, /\bhire\b/i, /\bresume\b/i, /\bwork\b/i, /\bemployment\b/i,
  /\bfreelance\b/i, /\bindustry\b/i, /\bprofessional\b/i,
];

const QUICK_REFERENCE_KEYWORDS = [
  /\bquick\b/i, /\btip\b/i, /\btips\b/i, /\bin \d+ minutes?\b/i,
  /\bshort\b/i, /\bfast\b/i, /\brapid\b/i, /\bsnippet\b/i,
  /\bcheatsheet\b/i, /\bcheat\s*sheet\b/i, /\bquickly\b/i,
  /\bsimple\b/i, /\bone[\s-]minute\b/i,
];

const STRUCTURED_LEARNING_KEYWORDS = [
  /\blearn\b/i, /\blearning\b/i, /\bcourse\b/i, /\bbeginner\b/i,
  /\broadmap\b/i, /\btutorial\b/i, /\bguide\b/i, /\bmaster\b/i,
  /\bbootcamp\b/i, /\bstart\b/i, /\bbegin\b/i, /\bfrom\s+scratch\b/i,
  /\bintroduction\b/i,
];

// ─── Category order per intent ────────────────────────────────────────────────

const INTENT_CATEGORY_ORDER: Record<QueryIntent, Array<'courses' | 'videos' | 'podcasts' | 'shorts' | 'creators'>> = {
  CAREER: ['podcasts', 'creators', 'videos', 'courses', 'shorts'],
  QUICK_REFERENCE: ['shorts', 'videos', 'podcasts', 'courses', 'creators'],
  STRUCTURED_LEARNING: ['courses', 'videos', 'podcasts', 'shorts', 'creators'],
};

// ─── Classifier ───────────────────────────────────────────────────────────────

/**
 * Classifies a search query into an intent and returns the ranked category order.
 * Decision order follows spec section 5 exactly.
 */
export function classifyIntent(query: string): IntentClassification {
  const q = query.trim();

  // Rule 1: Career intent
  if (CAREER_KEYWORDS.some((kw) => kw.test(q))) {
    return {
      intent: 'CAREER',
      categoryOrder: INTENT_CATEGORY_ORDER.CAREER,
    };
  }

  // Rule 2: Quick reference intent
  if (QUICK_REFERENCE_KEYWORDS.some((kw) => kw.test(q))) {
    return {
      intent: 'QUICK_REFERENCE',
      categoryOrder: INTENT_CATEGORY_ORDER.QUICK_REFERENCE,
    };
  }

  // Rule 3 + default: Structured learning
  // Matches "learn", "course", "beginner", "roadmap", or broad topic with no modifier
  return {
    intent: 'STRUCTURED_LEARNING',
    categoryOrder: INTENT_CATEGORY_ORDER.STRUCTURED_LEARNING,
  };
}
