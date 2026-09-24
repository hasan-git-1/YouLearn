/**
 * YouLearn — AI Service (Phase 2: Google Gemini Integration)
 *
 * Grounded AI service interface powered by Google Gemini (gemini-2.5-flash).
 * Rules:
 *   - Ground all outputs strictly in indexed content metadata
 *   - Enforce structured JSON schemas for every response
 *   - Safe fallbacks on API or parsing failures
 */

import { GoogleGenAI, Type, Schema } from '@google/genai';
import type {
  AITopicOverview,
  AIRelevanceBlurb,
  AILearningPath,
  LLMClassificationOutput,
  ContentType,
  Difficulty,
} from '@/types';

// Singleton instance helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[AI] GEMINI_API_KEY is not configured in environment variables.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

const DEFAULT_MODEL = 'gemini-2.5-flash';

/**
 * 7.1 — Generate a structured topic overview grounded in indexed content.
 */
export async function generateTopicOverview(
  topicName: string,
  indexedContent: { title: string; description: string | null; contentType?: string }[]
): Promise<AITopicOverview | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  try {
    const contentContext = indexedContent
      .slice(0, 15)
      .map((item, idx) => `[${idx + 1}] Title: ${item.title}\nDescription: ${item.description ?? 'N/A'}`)
      .join('\n\n');

    const prompt = `You are an expert curriculum designer and AI learning guide.
Analyze the following indexed learning resources for the topic: "${topicName}".
Generate a clear, high-signal, engaging overview for a learner starting this topic.

Indexed resources available in database:
${contentContext || 'General topic resources'}

Strict Requirements:
1. "what_is_it": A concise, engaging 2-3 sentence explanation of what ${topicName} is and why it matters today.
2. "what_to_learn": Array of 4-6 essential core concepts / technologies a student must master in logical sequence.
3. "career_context": 1-2 sentences on career paths, industry demand, or practical application (or null if purely theoretical/hobby).
4. "recommended_starting_point": Actionable advice on where a beginner should begin based on the indexed curriculum.
5. "confidence_note": A brief 1-sentence note confirming this overview is synthesized for YouLearn learners.

Return only valid JSON matching the schema.`;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        what_is_it: { type: Type.STRING },
        what_to_learn: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        career_context: { type: Type.STRING, nullable: true },
        recommended_starting_point: { type: Type.STRING },
        confidence_note: { type: Type.STRING },
      },
      required: ['what_is_it', 'what_to_learn', 'recommended_starting_point', 'confidence_note'],
    };

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.2,
      },
    });

    if (!response.text) return null;
    return JSON.parse(response.text) as AITopicOverview;
  } catch (error) {
    console.error('[AI] generateTopicOverview error:', error);
    return null;
  }
}

/**
 * 7.2 — Generate a 1-2 sentence "why this is relevant" blurb for a content item.
 */
export async function generateRelevanceBlurb(
  userQuery: string,
  itemMetadata: { title: string; description: string | null; contentType: string }
): Promise<AIRelevanceBlurb | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  try {
    const prompt = `You are a learning recommender system. Explain why this ${itemMetadata.contentType} is relevant to a user searching for "${userQuery}".

Content Title: ${itemMetadata.title}
Content Description: ${itemMetadata.description ?? 'No description provided'}

Rules:
- Write exactly 1 to 2 crisp, high-value sentences.
- Focus on what the student will learn or build from this item.
- Do not use generic filler words like "This video is great".`;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        blurb: { type: Type.STRING },
      },
      required: ['blurb'],
    };

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.3,
      },
    });

    if (!response.text) return null;
    const parsed = JSON.parse(response.text) as { blurb: string };
    return parsed.blurb;
  } catch (error) {
    console.error('[AI] generateRelevanceBlurb error:', error);
    return null;
  }
}

/**
 * 7.3 — Generate a structured learning path from indexed courses/videos.
 * Every recommended item MUST reference a valid ID from the provided indexed content.
 */
export async function generateLearningPath(
  topicName: string,
  indexedContent: {
    id: string;
    title: string;
    contentType: string;
    durationSeconds: number | null;
    difficulty: string;
  }[]
): Promise<AILearningPath | null> {
  const ai = getGeminiClient();
  if (!ai || indexedContent.length === 0) return null;

  try {
    const catalogJson = JSON.stringify(
      indexedContent.map((c) => ({
        id: c.id,
        title: c.title,
        type: c.contentType,
        difficulty: c.difficulty,
        minutes: c.durationSeconds ? Math.round(c.durationSeconds / 60) : null,
      }))
    );

    const prompt = `You are a curriculum architect. Organize the following real indexed database items into a progressive, step-by-step learning path for "${topicName}".

Indexed Content Database:
${catalogJson}

Rules:
1. Divide the learning path into 2 to 4 progressive levels (e.g. Level 1: Fundamentals, Level 2: Intermediate Concepts, Level 3: Advanced Applications).
2. For each level:
   - Provide a descriptive title (e.g. "Core Fundamentals & Setup")
   - Provide 2-4 key concepts taught in that stage
   - "recommended_video_ids": MUST ONLY contain valid "id" strings from the provided list above that belong in this level.
   - "recommended_course_id": Optional course ID from the list if a dedicated playlist exists for this level (or null).
   - "estimated_hours": Realistic estimate of study hours for this level.
3. NEVER invent or hallucinate IDs. Only use IDs present in the input catalog.`;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        levels: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.INTEGER },
              title: { type: Type.STRING },
              concepts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommended_video_ids: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommended_course_id: { type: Type.STRING, nullable: true },
              estimated_hours: { type: Type.NUMBER },
            },
            required: ['level', 'title', 'concepts', 'recommended_video_ids', 'estimated_hours'],
          },
        },
      },
      required: ['levels'],
    };

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.1,
      },
    });

    if (!response.text) return null;
    return JSON.parse(response.text) as AILearningPath;
  } catch (error) {
    console.error('[AI] generateLearningPath error:', error);
    return null;
  }
}

/**
 * Phase 2 LLM Fallback Classifier for ambiguous content.
 */
export async function classifyWithLLMFallback(metadata: {
  title: string;
  description: string | null;
  durationSeconds: number | null;
  channelTitle?: string;
}): Promise<LLMClassificationOutput | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  try {
    const prompt = `Classify this YouTube content for an educational platform:
Title: ${metadata.title}
Channel: ${metadata.channelTitle ?? 'Unknown'}
Duration: ${metadata.durationSeconds ? `${Math.round(metadata.durationSeconds / 60)} mins` : 'Unknown'}
Description: ${metadata.description?.slice(0, 400) ?? 'N/A'}`;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        content_type: {
          type: Type.STRING,
          enum: ['course', 'podcast', 'video', 'short', 'interview', 'lecture'],
        },
        content_type_confidence: { type: Type.NUMBER },
        difficulty: {
          type: Type.STRING,
          enum: ['beginner', 'intermediate', 'advanced', 'unknown'],
        },
        topics: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        is_likely_fabricated_or_low_quality: { type: Type.BOOLEAN },
      },
      required: [
        'content_type',
        'content_type_confidence',
        'difficulty',
        'topics',
        'is_likely_fabricated_or_low_quality',
      ],
    };

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.1,
      },
    });

    if (!response.text) return null;
    const parsed = JSON.parse(response.text) as {
      content_type: string;
      content_type_confidence: number;
      difficulty: string;
      topics: string[];
      is_likely_fabricated_or_low_quality: boolean;
    };

    return {
      content_type: parsed.content_type as ContentType,
      content_type_confidence: parsed.content_type_confidence,
      difficulty: parsed.difficulty as Difficulty,
      topics: parsed.topics,
      is_likely_fabricated_or_low_quality: parsed.is_likely_fabricated_or_low_quality,
    };
  } catch (error) {
    console.error('[AI] classifyWithLLMFallback error:', error);
    return null;
  }
}
