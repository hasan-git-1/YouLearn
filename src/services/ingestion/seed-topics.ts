export interface SeedTopic {
  slug: string;
  name: string;
  aliases: readonly string[];
}

/**
 * The launch catalog. Keep this list as the sole source of truth for seed
 * ingestion, seeded-query matching, and the scheduled refresh job.
 *
 * ALIASES: each entry must include every realistic free-text phrasing a user
 * might type. The `resolveSeedTopic()` matcher below only accepts complete
 * alias matches to avoid cross-contamination between adjacent subjects.
 */
export const SEED_TOPICS: readonly SeedTopic[] = [
  { slug: 'ai-engineering', name: 'AI Engineering', aliases: ['ai engineering', 'ai engineer', 'llm engineering', 'artificial intelligence engineering', 'ai dev'] },
  { slug: 'cybersecurity', name: 'Cybersecurity', aliases: ['cybersecurity', 'cyber security', 'information security', 'infosec', 'ethical hacking'] },
  { slug: 'data-science', name: 'Data Science', aliases: ['data science', 'data scientist', 'data analysis', 'data analytics'] },
  { slug: 'database-engineering', name: 'Database Engineering', aliases: ['database engineering', 'database design', 'database development', 'sql database', 'database admin'] },
  { slug: 'devops-cloud-engineering', name: 'DevOps Cloud Engineering', aliases: ['devops cloud engineering', 'devops', 'cloud engineering', 'cloud computing', 'devops engineering', 'cloud devops'] },
  { slug: 'digital-marketing', name: 'Digital Marketing', aliases: ['digital marketing', 'online marketing', 'social media marketing', 'seo marketing'] },
  { slug: 'english-communication', name: 'English Communication', aliases: ['english communication', 'spoken english', 'business english', 'english speaking', 'english language'] },
  { slug: 'entrepreneurship', name: 'Entrepreneurship', aliases: ['entrepreneurship', 'startup business', 'startup', 'startups', 'business startup'] },
  { slug: 'full-stack-web-development', name: 'Full Stack Web Development', aliases: ['full stack web development', 'full stack development', 'full stack', 'fullstack', 'full stack dev', 'web development'] },
  { slug: 'graphic-design', name: 'Graphic Design', aliases: ['graphic design', 'graphic designing', 'graphics design'] },
  { slug: 'javascript-typescript', name: 'JavaScript TypeScript', aliases: ['javascript typescript', 'javascript', 'typescript', 'js typescript', 'js ts'] },
  { slug: 'machine-learning', name: 'Machine Learning', aliases: ['machine learning', 'ml', 'deep learning', 'machine learning ai'] },
  { slug: 'nextjs', name: 'Next.js', aliases: ['nextjs', 'next js', 'nextjs development', 'next js development', 'next.js', 'next.js development'] },
  { slug: 'nodejs', name: 'Node.js', aliases: ['nodejs', 'node js', 'nodejs development', 'node js development', 'node.js', 'node.js development'] },
  { slug: 'personal-finance', name: 'Personal Finance', aliases: ['personal finance', 'money management', 'financial planning', 'finance'] },
  { slug: 'physics-jee-neet', name: 'Physics JEE NEET', aliases: ['physics jee neet', 'jee physics', 'neet physics', 'iit jee physics', 'physics jee'] },
  { slug: 'product-management', name: 'Product Management', aliases: ['product management', 'product manager', 'pm', 'product management skills'] },
  { slug: 'python-programming', name: 'Python Programming', aliases: ['python programming', 'python', 'python development', 'python coding', 'learn python'] },
  { slug: 'react-development', name: 'React Development', aliases: ['react development', 'reactjs', 'react js', 'frontend development', 'react.js', 'react'] },
  { slug: 'stock-market-basics', name: 'Stock Market Basics', aliases: ['stock market basics', 'stock market', 'stock trading', 'share market', 'investing'] },
  { slug: 'system-design', name: 'System Design', aliases: ['system design', 'systems design', 'system architecture', 'software architecture'] },
  { slug: 'upsc-preparation', name: 'UPSC Preparation', aliases: ['upsc preparation', 'upsc', 'upsc prep', 'ias preparation', 'civil services'] },
  { slug: 'ux-design', name: 'UX Design', aliases: ['ux design', 'user experience design', 'ui ux design', 'ux ui design', 'ui design'] },
  { slug: 'video-editing', name: 'Video Editing', aliases: ['video editing', 'video edit', 'editing videos', 'video editor', 'video production'] },
];

export const SEED_SEARCH_VARIANTS = (topic: string): readonly string[] => [
  topic,
  `${topic} course`,
  `${topic} tutorial`,
  `${topic} podcast`,
  `${topic} interview`,
  `${topic} for beginners`,
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function getSeedTopicBySlug(slug: string): SeedTopic | undefined {
  return SEED_TOPICS.find((topic) => topic.slug === slug);
}

/**
 * Maps close, intentional variants to the pre-ingested catalog. The matcher
 * only accepts complete aliases, avoiding accidental matches on adjacent
 * subjects such as generic web development.
 *
 * Match strategy (in priority order):
 *   1. Exact alias match (padded word boundary)
 *   2. Slug-form match (query with hyphens instead of spaces)
 *   3. Query IS a substring match of the alias (catches "video editing" matching alias "video editing")
 */
export function resolveSeedTopic(query: string): SeedTopic | undefined {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return undefined;
  const paddedQuery = ` ${normalizedQuery} `;

  // Strategy 1: padded alias match (original logic — most cases)
  const aliasMatch = SEED_TOPICS.find((topic) =>
    topic.aliases.some((alias) => paddedQuery.includes(` ${normalize(alias)} `))
  );
  if (aliasMatch) return aliasMatch;

  // Strategy 2: slug-form match (user typed "video-editing" or "full-stack")
  const slugQuery = normalizedQuery.replace(/\s+/g, '-');
  const slugMatch = SEED_TOPICS.find((topic) => topic.slug === slugQuery);
  if (slugMatch) return slugMatch;

  // Strategy 3: the query itself IS one of the aliases (exact match after normalization)
  const exactMatch = SEED_TOPICS.find((topic) =>
    topic.aliases.some((alias) => normalize(alias) === normalizedQuery)
  );
  if (exactMatch) return exactMatch;

  return undefined;
}

