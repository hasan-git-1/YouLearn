export interface SeedTopic {
  slug: string;
  name: string;
  aliases: readonly string[];
}

/**
 * The launch catalog. Keep this list as the sole source of truth for seed
 * ingestion, seeded-query matching, and the scheduled refresh job.
 */
export const SEED_TOPICS: readonly SeedTopic[] = [
  { slug: 'ai-engineering', name: 'AI Engineering', aliases: ['ai engineering', 'ai engineer', 'llm engineering'] },
  { slug: 'cybersecurity', name: 'Cybersecurity', aliases: ['cybersecurity', 'cyber security'] },
  { slug: 'data-science', name: 'Data Science', aliases: ['data science', 'data scientist'] },
  { slug: 'database-engineering', name: 'Database Engineering', aliases: ['database engineering', 'database design'] },
  { slug: 'devops-cloud-engineering', name: 'DevOps Cloud Engineering', aliases: ['devops cloud engineering', 'devops', 'cloud engineering'] },
  { slug: 'digital-marketing', name: 'Digital Marketing', aliases: ['digital marketing'] },
  { slug: 'english-communication', name: 'English Communication', aliases: ['english communication', 'spoken english', 'business english'] },
  { slug: 'entrepreneurship', name: 'Entrepreneurship', aliases: ['entrepreneurship', 'startup business'] },
  { slug: 'full-stack-web-development', name: 'Full Stack Web Development', aliases: ['full stack web development', 'full stack development', 'full stack'] },
  { slug: 'graphic-design', name: 'Graphic Design', aliases: ['graphic design'] },
  { slug: 'javascript-typescript', name: 'JavaScript TypeScript', aliases: ['javascript typescript', 'javascript', 'typescript'] },
  { slug: 'machine-learning', name: 'Machine Learning', aliases: ['machine learning'] },
  { slug: 'nextjs', name: 'Next.js', aliases: ['nextjs', 'next js', 'nextjs development', 'next js development'] },
  { slug: 'nodejs', name: 'Node.js', aliases: ['nodejs', 'node js', 'nodejs development', 'node js development'] },
  { slug: 'personal-finance', name: 'Personal Finance', aliases: ['personal finance'] },
  { slug: 'physics-jee-neet', name: 'Physics JEE NEET', aliases: ['physics jee neet', 'jee physics', 'neet physics'] },
  { slug: 'product-management', name: 'Product Management', aliases: ['product management', 'product manager'] },
  { slug: 'python-programming', name: 'Python Programming', aliases: ['python programming', 'python'] },
  { slug: 'react-development', name: 'React Development', aliases: ['react development', 'reactjs', 'react js', 'frontend development'] },
  { slug: 'stock-market-basics', name: 'Stock Market Basics', aliases: ['stock market basics', 'stock market'] },
  { slug: 'system-design', name: 'System Design', aliases: ['system design'] },
  { slug: 'upsc-preparation', name: 'UPSC Preparation', aliases: ['upsc preparation', 'upsc'] },
  { slug: 'ux-design', name: 'UX Design', aliases: ['ux design', 'user experience design'] },
  { slug: 'video-editing', name: 'Video Editing', aliases: ['video editing'] },
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
 */
export function resolveSeedTopic(query: string): SeedTopic | undefined {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return undefined;
  const paddedQuery = ` ${normalizedQuery} `;

  return SEED_TOPICS.find((topic) =>
    topic.aliases.some((alias) => paddedQuery.includes(` ${normalize(alias)} `))
  );
}
