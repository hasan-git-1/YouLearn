export interface TopicDefinition {
  slug: string;
  name: string;
  description: string;
  learn: readonly string[];
  aliases: readonly string[];
  includeKeywords: readonly string[];
  excludeKeywords: readonly string[];
  minimumScore: number;
}

/** The only public learning catalogue. Search, routes, cards and ingestion use this list. */
export const TOPICS = [
  { slug: 'full-stack-development', name: 'Full Stack Development', description: 'Build complete web products by connecting polished frontends, reliable backends, and data layers.', learn: ['Frontend and backend integration', 'Databases and data modelling', 'REST APIs and authentication', 'Testing and deployment'], aliases: ['full-stack', 'fullstack', 'full-stack-dev', 'full-stack-developer', 'web-development'], includeKeywords: ['full stack', 'mern', 'mean', 'frontend backend'], excludeKeywords: ['python snake'], minimumScore: 1 },
  { slug: 'python-development', name: 'Python Development', description: 'Learn Python for practical software, automation, APIs, and maintainable applications.', learn: ['Syntax and data structures', 'Object-oriented programming', 'Virtual environments and packages', 'Flask, Django, and FastAPI', 'Testing and scripting'], aliases: ['python', 'python-dev', 'python-programming'], includeKeywords: ['python'], excludeKeywords: ['python snake', 'mern', 'react only'], minimumScore: 1 },
  { slug: 'ai-engineering', name: 'AI Engineering', description: 'Ship useful AI applications with LLM APIs, retrieval, agents, evaluation, and deployment.', learn: ['LLM APIs', 'Prompt engineering', 'RAG and vector databases', 'Agents and tool use', 'Evaluation and deployment'], aliases: ['ai-engineer', 'ai-engineering', 'llm-engineering', 'generative-ai-engineering'], includeKeywords: ['llm', 'rag', 'agent', 'prompt engineering', 'vector db', 'ai app'], excludeKeywords: ['classical ml theory', 'train from scratch'], minimumScore: 1 },
  { slug: 'cybersecurity', name: 'Cyber Security', description: 'Develop defensive security skills, understand attacks, and protect systems responsibly.', learn: ['Network security', 'OWASP Top 10', 'Cryptography basics', 'Pentesting foundations', 'Threat modelling and incident response'], aliases: ['cyber-security', 'cyber', 'infosec', 'information-security', 'ethical-hacking'], includeKeywords: ['security', 'hacking', 'pentesting', 'owasp'], excludeKeywords: ['cyberpunk', 'gaming', 'cyber news'], minimumScore: 1 },
  { slug: 'data-science', name: 'Data Science', description: 'Turn data into clear analyses, visual stories, and evidence-based decisions.', learn: ['pandas and NumPy', 'Exploratory analysis', 'Statistics', 'Visualisation', 'SQL and feature engineering'], aliases: ['data-scientist', 'datascience', 'data-analytics'], includeKeywords: ['pandas', 'eda', 'statistics', 'data analysis', 'visualization'], excludeKeywords: ['deep learning', 'model training'], minimumScore: 1 },
  { slug: 'ai-ml', name: 'AI / ML', description: 'Master machine-learning foundations, neural networks, model evaluation, and modern frameworks.', learn: ['Supervised and unsupervised learning', 'Neural networks', 'Training and evaluation', 'Math foundations', 'scikit-learn and PyTorch'], aliases: ['ai', 'ml', 'aiml', 'ai-and-ml', 'machine-learning', 'deep-learning'], includeKeywords: ['machine learning', 'neural network', 'deep learning', 'ml algorithm'], excludeKeywords: ['rag', 'agent tutorial', 'llm app'], minimumScore: 1 },
  { slug: 'nodejs', name: 'Node.js', description: 'Create fast server-side JavaScript services, APIs, and production backends.', learn: ['Event loop', 'Modules', 'Express and Fastify', 'Async patterns and streams', 'REST APIs'], aliases: ['node', 'node-js', 'nodejs', 'node.js'], includeKeywords: ['node', 'express', 'backend javascript'], excludeKeywords: ['react frontend', 'browser javascript'], minimumScore: 1 },
  { slug: 'reactjs', name: 'React.js', description: 'Build responsive interfaces with components, hooks, state, routing, and performance techniques.', learn: ['Components and hooks', 'State management', 'Routing', 'Performance', 'Next.js basics'], aliases: ['react', 'react-js', 'reactjs', 'react.js'], includeKeywords: ['react', 'hooks', 'next.js'], excludeKeywords: ['node backend', 'vanilla javascript only'], minimumScore: 1 },
  { slug: 'javascript', name: 'JavaScript', description: 'Learn the core language that powers modern web development, from syntax to asynchronous code.', learn: ['ES6+', 'Closures', 'Async and await', 'DOM', 'Prototypes'], aliases: ['js', 'javascript', 'java-script', 'ecmascript'], includeKeywords: ['javascript', 'vanilla js', 'es6'], excludeKeywords: ['java', 'react only', 'node only'], minimumScore: 1 },
  { slug: 'dsa', name: 'DSA', description: 'Build problem-solving confidence with data structures, algorithms, and complexity analysis.', learn: ['Arrays and linked lists', 'Trees and graphs', 'Sorting and searching', 'Recursion and dynamic programming', 'Complexity analysis'], aliases: ['data-structures', 'algorithms', 'data-structures-and-algorithms', 'dsa'], includeKeywords: ['data structures', 'algorithms', 'leetcode', 'complexity'], excludeKeywords: ['syntax only'], minimumScore: 1 },
] as const satisfies readonly TopicDefinition[];

export type TopicSlug = (typeof TOPICS)[number]['slug'];

export function getTopicBySlug(slug: string): TopicDefinition | undefined {
  return TOPICS.find((topic) => topic.slug === slug);
}

export function normalizeTopicValue(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\/_&\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export type TopicMatch = { matched: true; topic: TopicDefinition; slug: TopicSlug } | { matched: false };

function editDistance(left: string, right: string): number {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const previous = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
      diagonal = previous;
    }
  }
  return row[right.length];
}

function isAdjacentTransposition(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  const differences = [...left].reduce<number[]>((result, character, index) => character === right[index] ? result : [...result, index], []);
  return differences.length === 2 && differences[1] === differences[0] + 1 && left[differences[0]] === right[differences[1]] && left[differences[1]] === right[differences[0]];
}

/**
 * Resolves only a configured topic. Multi-word searches are supported when a
 * valid alias is at the beginning; the remaining words are modifiers.
 */
export function matchTopic(query: string): TopicMatch {
  const normalized = normalizeTopicValue(query);
  if (!normalized || normalized.length > 120) return { matched: false };

  const candidates = TOPICS.flatMap((topic) => [topic.slug, ...topic.aliases.map(normalizeTopicValue)].map((value) => ({ topic, value })));
  const exact = candidates.find((candidate) => candidate.value === normalized);
  if (exact) return { matched: true, topic: exact.topic, slug: exact.topic.slug as TopicSlug };

  const hasMultipleTopics = TOPICS.filter((topic) => [topic.slug, ...topic.aliases.map(normalizeTopicValue)]
    .some((candidate) => new RegExp(`(?:^|-)${candidate}(?:-|$)`).test(normalized))).length > 1;
  if (hasMultipleTopics) return { matched: false };

  const modifierMatch = candidates.filter(({ value }) => normalized.startsWith(`${value}-`));
  const uniqueModifierTopics = [...new Map(modifierMatch.map(({ topic }) => [topic.slug, topic])).values()];
  if (uniqueModifierTopics.length === 1) {
    const topic = uniqueModifierTopics[0];
    return { matched: true, topic, slug: topic.slug as TopicSlug };
  }

  if (normalized.length >= 6) {
    const fuzzyTopics = [...new Map(candidates.filter(({ value }) => editDistance(normalized, value) <= 1 || isAdjacentTransposition(normalized, value)).map(({ topic }) => [topic.slug, topic])).values()];
    if (fuzzyTopics.length === 1) {
      const topic = fuzzyTopics[0];
      return { matched: true, topic, slug: topic.slug as TopicSlug };
    }
  }
  return { matched: false };
}
