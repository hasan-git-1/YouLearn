import { classifyVideo } from '../src/services/classification/rules';
import type { RawYouTubeVideo } from '../src/types';

interface TestCase {
  name: string;
  query: string;
  validTypes: string[];
  forbiddenTypes: string[];
  video: RawYouTubeVideo;
}

const testCases: TestCase[] = [
  {
    name: '9-Hour Full Course (The classic failure case)',
    query: 'Python',
    validTypes: ['video', 'lecture'],
    forbiddenTypes: ['podcast', 'short'],
    video: {
      id: 'rfscVS0vtbw',
      title: 'Python for Beginners - Full Course [9 Hours]',
      description: 'Learn Python from scratch in this complete 9 hour programming tutorial course.',
      channelTitle: 'freeCodeCamp.org',
      channelId: 'UC8butISFwT-Wl7EV0hUK0BQ',
      duration: 'PT9H12M45S',
      viewCount: '15000000',
      likeCount: '450000',
      publishedAt: '2022-01-01T00:00:00Z',
    },
  },
  {
    name: 'Long-form Interview Podcast with Guest',
    query: 'AI Engineering',
    validTypes: ['podcast'],
    forbiddenTypes: ['video', 'lecture', 'short'],
    video: {
      id: 'lex_400',
      title: 'Lex Fridman Podcast #400 - Yann LeCun: Meta AI, Open Source, and AGI',
      description: 'Yann LeCun is VP & Chief AI Scientist at Meta. On this episode we talk about LLMs and the future of artificial intelligence.',
      channelTitle: 'Lex Fridman Podcast',
      channelId: 'UCSHZKyawb77ixDdsGog4iWA',
      duration: 'PT3H15M20S',
      viewCount: '850000',
      likeCount: '32000',
      publishedAt: '2023-11-01T00:00:00Z',
    },
  },
  {
    name: 'YouTube Short (< 90 seconds)',
    query: 'React',
    validTypes: ['short'],
    forbiddenTypes: ['video', 'podcast', 'lecture'],
    video: {
      id: 'short_react_01',
      title: 'React 19 Server Actions in 45 Seconds #shorts',
      description: 'Quick tip on how to use server actions in Next.js #shorts #react',
      channelTitle: 'Fireship',
      channelId: 'UCsBjURrPoezykLs9EqgamOA',
      duration: 'PT45S',
      viewCount: '340000',
      likeCount: '28000',
      publishedAt: '2024-05-01T00:00:00Z',
    },
  },
  {
    name: 'Full Stack 12-Hour Tutorial Bootcamp',
    query: 'Full Stack Dev',
    validTypes: ['video', 'lecture'],
    forbiddenTypes: ['podcast', 'short'],
    video: {
      id: 'fs_bootcamp_12h',
      title: 'Full Stack Web Development Bootcamp from Scratch - 12 Hour Course',
      description: 'Step by step complete guide to becoming a full stack web developer using React, Node, and Postgres.',
      channelTitle: 'Tech With Tim',
      channelId: 'UC4JX40jDee_tINb439CE97Q',
      duration: 'PT12H05M10S',
      viewCount: '2100000',
      likeCount: '95000',
      publishedAt: '2023-08-15T00:00:00Z',
    },
  },
  {
    name: 'Conversational Developer Podcast Episode',
    query: 'Web Development',
    validTypes: ['podcast'],
    forbiddenTypes: ['video', 'short'],
    video: {
      id: 'syntax_750',
      title: 'Syntax | Ep 750: We Talk with Creator of Vite and Vue',
      description: 'On this show Wes Bos and Scott Tolinski host Evan You to talk about Vite, Rolldown, and the future of JavaScript tooling.',
      channelTitle: 'Syntax - Tasty Web Development Podcast',
      channelId: 'UC-T8W79DN6PBnzOmLvwPMrw',
      duration: 'PT1H05M30S',
      viewCount: '45000',
      likeCount: '2300',
      publishedAt: '2024-02-10T00:00:00Z',
    },
  },
  {
    name: 'Academic University Lecture',
    query: 'Algorithms',
    validTypes: ['lecture', 'video'],
    forbiddenTypes: ['podcast', 'short'],
    video: {
      id: 'mit_6006_01',
      title: 'MIT 6.006 Introduction to Algorithms, Spring 2020 - Lecture 1: Course Overview',
      description: 'Massachusetts Institute of Technology (MIT) university course lecture by Professor Erik Demaine.',
      channelTitle: 'MIT OpenCourseWare',
      channelId: 'UCEBb1b_L6zDS3xTUrIALZOw',
      duration: 'PT52M45S',
      viewCount: '3200000',
      likeCount: '87000',
      publishedAt: '2020-03-01T00:00:00Z',
    },
  },
  {
    name: 'Tutorial Titled "Episode 1" (Anti-pattern test)',
    query: 'Python',
    validTypes: ['video'],
    forbiddenTypes: ['podcast', 'short'],
    video: {
      id: 'cwh_py_01',
      title: 'Episode 1: Python Programming Tutorial for Beginners from Scratch',
      description: 'Learn how to install Python and write your first Hello World program in this beginner tutorial.',
      channelTitle: 'CodeWithHarry',
      channelId: 'UCeVMnSShP_Iviwkknt83cww',
      duration: 'PT38M12S',
      viewCount: '1800000',
      likeCount: '62000',
      publishedAt: '2022-04-12T00:00:00Z',
    },
  },
  {
    name: 'Niche: Distributed Systems Consensus',
    query: 'Distributed Systems',
    validTypes: ['video'],
    forbiddenTypes: ['podcast', 'short'],
    video: {
      id: 'raft_explained',
      title: 'Raft Consensus Algorithm Explained - Deep Dive into Distributed Systems',
      description: 'Complete breakdown of leader election, log replication, and safety guarantees in Raft.',
      channelTitle: 'Hussein Nasser',
      channelId: 'UC_ML5xP23TOWKUcc-oAE_Eg',
      duration: 'PT42M15S',
      viewCount: '190000',
      likeCount: '8500',
      publishedAt: '2021-06-20T00:00:00Z',
    },
  },
  {
    name: 'Stock Market Technical Analysis Tutorial',
    query: 'Stock Market Basics',
    validTypes: ['video'],
    forbiddenTypes: ['podcast', 'short'],
    video: {
      id: 'stocks_ta_01',
      title: 'Stock Market Basics for Beginners: How to Read Candlestick Charts [Full Guide]',
      description: 'Step by step beginner tutorial on support, resistance, and volume profile for investing.',
      channelTitle: 'Rayner Teo',
      channelId: 'UCeqjjmRUX1iGv1u2_FkF8Tw',
      duration: 'PT36M40S',
      viewCount: '950000',
      likeCount: '42000',
      publishedAt: '2023-01-10T00:00:00Z',
    },
  },
  {
    name: 'Niche Finance Podcast',
    query: 'Macroeconomics',
    validTypes: ['podcast'],
    forbiddenTypes: ['video', 'short'],
    video: {
      id: 'macro_pod_01',
      title: 'Odd Lots Podcast: Conversation with Zoltan Pozsar on Global Liquidity',
      description: 'Bloomberg hosts Joe Weisenthal and Tracy Alloway interview Zoltan Pozsar on money markets.',
      channelTitle: 'Bloomberg Podcasts',
      channelId: 'UCrM7B7SL_g1edFjk3-QLCtw',
      duration: 'PT58M12S',
      viewCount: '110000',
      likeCount: '4900',
      publishedAt: '2023-09-18T00:00:00Z',
    },
  },
];

console.log('═══════════════════════════════════════════════════════════════');
console.log('TUBIQ CLASSIFICATION PIPELINE BATTERY TEST');
console.log('═══════════════════════════════════════════════════════════════\n');

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const result = classifyVideo(tc.video);
  const isValid = tc.validTypes.includes(result.contentType);
  const isForbidden = tc.forbiddenTypes.includes(result.contentType);

  if (isValid && !isForbidden) {
    passed++;
    console.log(`✅ PASS: [${tc.query}] ${tc.name}`);
    console.log(`   Result: ${result.contentType} (Confidence: ${result.confidence})\n`);
  } else {
    failed++;
    console.error(`❌ FAIL: [${tc.query}] ${tc.name}`);
    console.error(`   Allowed: [${tc.validTypes.join(', ')}], Got: ${result.contentType}`);
    if (isForbidden) {
      console.error(`   REGRESSION: Matched forbidden type "${result.contentType}"!`);
    }
    console.error(`   Title: "${tc.video.title}"\n`);
  }
}

console.log('───────────────────────────────────────────────────────────────');
console.log(`Total: ${testCases.length} | Passed: ${passed} | Failed: ${failed}`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL CLASSIFICATION TESTS PASSED CLEANLY! 🎯');
}
