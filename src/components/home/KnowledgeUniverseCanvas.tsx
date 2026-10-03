'use client';

import React, { useEffect, useRef, useCallback } from 'react';

export interface KnowledgeGraphTopic {
  root: string;
  branches: {
    name: string;
    type: 'course' | 'video' | 'podcast' | 'creator' | 'concept';
    children?: string[];
  }[];
}

export const TOPIC_PRESETS: Record<string, KnowledgeGraphTopic> = {
  'system design': {
    root: 'System Design',
    branches: [
      { name: 'Scalability & Load Balancing', type: 'concept', children: ['Consistent Hashing', 'Reverse Proxies'] },
      { name: 'Database Architecture', type: 'course', children: ['Sharding & Partitioning', 'ACID vs BASE'] },
      { name: 'Distributed Caching', type: 'video', children: ['Redis Clusters', 'Cache Invalidation'] },
      { name: 'Microservices & gRPC', type: 'creator', children: ['Event-Driven Pub/Sub', 'Kafka Queues'] },
      { name: 'Security & Rate Limiting', type: 'podcast', children: ['Token Buckets', 'mTLS & Auth'] },
    ],
  },
  react: {
    root: 'React 19 Ecosystem',
    branches: [
      { name: 'React Server Components', type: 'concept', children: ['Server Actions', 'Streaming SSR'] },
      { name: 'Concurrent State', type: 'course', children: ['useTransition', 'useOptimistic'] },
      { name: 'Next.js App Router', type: 'video', children: ['Turbopack', 'Route Handlers'] },
      { name: 'Performance & Virtual DOM', type: 'creator', children: ['Memoization', 'Compiler Optimizations'] },
      { name: 'Modern Fullstack', type: 'podcast', children: ['Tailwind v4', 'Zustand & TanStack'] },
    ],
  },
  'ai engineering': {
    root: 'AI Engineering',
    branches: [
      { name: 'LLM Prompt Engineering', type: 'concept', children: ['Chain-of-Thought', 'Few-Shot Grounding'] },
      { name: 'RAG & Vector Pipelines', type: 'course', children: ['pgvector', 'Semantic Chunking'] },
      { name: 'Fine-Tuning & Quantization', type: 'video', children: ['LoRA & QLoRA', 'Synthetic Data'] },
      { name: 'Agentic Workflows', type: 'creator', children: ['Tool Calling', 'Multi-Agent Teams'] },
      { name: 'Evaluation & Safety', type: 'podcast', children: ['Guardrails', 'Benchmark Metrics'] },
    ],
  },
  python: {
    root: 'Python Architecture',
    branches: [
      { name: 'Core Metaprogramming', type: 'concept', children: ['Decorators', 'Generators & Yield'] },
      { name: 'FastAPI & Async IO', type: 'course', children: ['Pydantic v2', 'Event Loop Internals'] },
      { name: 'Data Engineering', type: 'video', children: ['Polars & Pandas', 'NumPy Vectors'] },
      { name: 'Automation & CLI', type: 'creator', children: ['Typer & Click', 'Playwright Scraping'] },
      { name: 'Machine Learning Basics', type: 'podcast', children: ['Scikit-learn', 'PyTorch Tensors'] },
    ],
  },
  'stock market': {
    root: 'Market Intelligence',
    branches: [
      { name: 'Fundamental Valuation', type: 'concept', children: ['DCF Modeling', 'Free Cash Flow'] },
      { name: 'Technical Analysis', type: 'course', children: ['Support & Resistance', 'Volume Profiles'] },
      { name: 'Portfolio Allocation', type: 'video', children: ['Modern Portfolio Theory', 'Sharpe Ratio'] },
      { name: 'Derivatives & Hedging', type: 'creator', children: ['Options Greeks', 'Risk Asymmetry'] },
      { name: 'Macroeconomics', type: 'podcast', children: ['Federal Reserve Rates', 'Inflation Yields'] },
    ],
  },
  'full stack': {
    root: 'Full Stack Mastery',
    branches: [
      { name: 'Frontend Architecture', type: 'concept', children: ['Next.js App Router', 'State Machines'] },
      { name: 'API Engineering', type: 'course', children: ['REST & GraphQL', 'Serverless Functions'] },
      { name: 'Postgres & Drizzle ORM', type: 'video', children: ['Schema Migrations', 'Indexing Strategies'] },
      { name: 'Auth & Security', type: 'creator', children: ['OAuth2 / JWT', 'Row Level Security'] },
      { name: 'DevOps & CI/CD', type: 'podcast', children: ['Docker Containers', 'Edge Deployment'] },
    ],
  },
};

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX?: number;
  targetY?: number;
  isOrganized?: boolean;
  baseRadius: number;
  radius: number;
  color: string;
  glowColor: string;
  label: string;
  type: 'root' | 'course' | 'video' | 'podcast' | 'creator' | 'concept' | 'particle';
  orbitAngle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  pulsePhase: number;
  clusterId?: number;
}

interface Photon {
  fromNode: Node;
  toNode: Node;
  progress: number;
  speed: number;
  color: string;
}

interface KnowledgeUniverseCanvasProps {
  activeQuery?: string;
  className?: string;
}

export function KnowledgeUniverseCanvas({
  activeQuery = '',
  className = '',
}: KnowledgeUniverseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const photonsRef = useRef<Photon[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const isVisibleRef = useRef<boolean>(true);

  // Identify matching preset from query
  const getMatchedPreset = useCallback((query: string): KnowledgeGraphTopic | null => {
    if (!query) return null;
    const clean = query.trim().toLowerCase();
    for (const [key, preset] of Object.entries(TOPIC_PRESETS)) {
      if (clean.includes(key) || key.includes(clean)) {
        return preset;
      }
    }
    // Generic fallback preset when user types an unrecognized custom query
    if (clean.length >= 3) {
      return {
        root: query.trim(),
        branches: [
          { name: 'Foundations & Concepts', type: 'concept', children: ['Core Principles', 'Taxonomy'] },
          { name: 'Comprehensive Courses', type: 'course', children: ['Step-by-step Guides', 'Curriculums'] },
          { name: 'Deep-Dive Walkthroughs', type: 'video', children: ['Real Implementations', 'Analysis'] },
          { name: 'Top Authority Creators', type: 'creator', children: ['Pedagogical Experts', 'Practitioners'] },
          { name: 'Discussions & Perspectives', type: 'podcast', children: ['Interviews', 'Case Studies'] },
        ],
      };
    }
    return null;
  }, []);

  // Initialize random cosmic nodes
  const initCosmicNodes = useCallback((width: number, height: number) => {
    const nodes: Node[] = [];
    const colors = {
      course: { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)' },
      video: { main: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)' },
      podcast: { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
      creator: { main: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
      concept: { main: '#6366f1', glow: 'rgba(99, 102, 241, 0.5)' },
      particle: { main: '#94a3b8', glow: 'rgba(148, 163, 184, 0.2)' },
    };

    const labels = [
      { text: 'System Design', type: 'course' as const },
      { text: 'React 19', type: 'video' as const },
      { text: 'AI Agents', type: 'concept' as const },
      { text: 'FastAPI', type: 'course' as const },
      { text: 'Vector RAG', type: 'concept' as const },
      { text: 'Data Engineering', type: 'creator' as const },
      { text: 'Postgres Internals', type: 'podcast' as const },
      { text: 'TypeScript 5.8', type: 'video' as const },
      { text: 'Docker & K8s', type: 'course' as const },
      { text: 'Machine Learning', type: 'concept' as const },
      { text: 'Distributed Systems', type: 'podcast' as const },
      { text: 'Web Security', type: 'creator' as const },
      { text: 'Next.js Turbopack', type: 'video' as const },
      { text: 'Microservices', type: 'concept' as const },
      { text: 'High Scale Redis', type: 'course' as const },
    ];

    // Main labeled clusters
    labels.forEach((item, i) => {
      const palette = colors[item.type];
      const angle = (i / labels.length) * Math.PI * 2 + Math.random() * 0.4;
      const dist = Math.min(width, height) * (0.22 + (i % 3) * 0.12);
      const cx = width / 2;
      const cy = height / 2;

      nodes.push({
        id: `major-${i}`,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist * 0.75,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        baseRadius: Math.random() * 2 + 4.5,
        radius: 4.5,
        color: palette.main,
        glowColor: palette.glow,
        label: item.text,
        type: item.type,
        pulsePhase: Math.random() * Math.PI * 2,
        clusterId: i % 4,
      });
    });

    // Secondary ambient connective nodes
    const ambientCount = Math.min(28, Math.floor((width * height) / 38000));
    for (let i = 0; i < ambientCount; i++) {
      const types: ('concept' | 'video' | 'particle')[] = ['concept', 'video', 'particle'];
      const t = types[i % types.length];
      const palette = colors[t];

      nodes.push({
        id: `ambient-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        baseRadius: Math.random() * 1.5 + 2,
        radius: 2.5,
        color: palette.main,
        glowColor: palette.glow,
        label: '',
        type: t,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    nodesRef.current = nodes;
  }, []);

  // Reorganize nodes into structured semantic constellation when topic is active
  const organizeGraph = useCallback(
    (preset: KnowledgeGraphTopic, width: number, height: number) => {
      const nodes = nodesRef.current;
      if (!nodes.length) return;

      const cx = width / 2;
      const cy = height * 0.46; // slightly above vertical center to frame hero headline

      // Node 0 is the root node
      if (nodes[0]) {
        nodes[0].targetX = cx;
        nodes[0].targetY = cy;
        nodes[0].isOrganized = true;
        nodes[0].label = preset.root;
        nodes[0].type = 'root';
        nodes[0].color = '#6366f1';
        nodes[0].glowColor = 'rgba(99, 102, 241, 0.9)';
        nodes[0].baseRadius = 8;
      }

      const branchCount = preset.branches.length;
      let nodeIdx = 1;

      preset.branches.forEach((branch, bIdx) => {
        const branchAngle = (bIdx / branchCount) * Math.PI * 2 - Math.PI / 2;
        const branchDist = Math.min(width, height) * 0.28;
        const bx = cx + Math.cos(branchAngle) * branchDist;
        const by = cy + Math.sin(branchAngle) * branchDist * 0.85;

        if (nodes[nodeIdx]) {
          nodes[nodeIdx].targetX = bx;
          nodes[nodeIdx].targetY = by;
          nodes[nodeIdx].isOrganized = true;
          nodes[nodeIdx].label = branch.name;
          nodes[nodeIdx].type = branch.type;
          nodes[nodeIdx].baseRadius = 6;
          nodeIdx++;
        }

        // Child leaves of this branch
        if (branch.children) {
          branch.children.forEach((childName, cIdx) => {
            if (nodes[nodeIdx]) {
              const spread = (cIdx - (branch.children!.length - 1) / 2) * 0.45;
              const leafAngle = branchAngle + spread;
              const leafDist = branchDist + Math.min(width, height) * 0.14;
              nodes[nodeIdx].targetX = cx + Math.cos(leafAngle) * leafDist;
              nodes[nodeIdx].targetY = cy + Math.sin(leafAngle) * leafDist * 0.85;
              nodes[nodeIdx].isOrganized = true;
              nodes[nodeIdx].label = childName;
              nodes[nodeIdx].type = 'concept';
              nodes[nodeIdx].baseRadius = 3.5;
              nodeIdx++;
            }
          });
        }
      });

      // Remaining nodes become ambient peripheral satellites
      for (let i = nodeIdx; i < nodes.length; i++) {
        nodes[i].isOrganized = false;
        nodes[i].targetX = undefined;
        nodes[i].targetY = undefined;
      }
    },
    []
  );

  // Reset graph back to ambient drift
  const relaxGraph = useCallback(() => {
    nodesRef.current.forEach((n) => {
      n.isOrganized = false;
      n.targetX = undefined;
      n.targetY = undefined;
      n.baseRadius = n.type === 'particle' ? 2 : 4.5;
    });
  }, []);

  // Watch activeQuery and transition graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    const preset = getMatchedPreset(activeQuery);
    if (preset) {
      organizeGraph(preset, width, height);
    } else {
      relaxGraph();
    }
  }, [activeQuery, getMatchedPreset, organizeGraph, relaxGraph]);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Respect reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.parentElement?.clientWidth || window.innerWidth;
      const h = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!nodesRef.current.length) {
        initCosmicNodes(w, h);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Pause when canvas not in view
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    });
    observer.observe(canvas);

    let lastTime = performance.now();

    const render = (time: number) => {
      if (!isVisibleRef.current) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);

      // ── 1. Fine Technical Coordinate Grid ─────────────────────────────
      const gridSize = 64;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.022)';
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let x = 0; x < w; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Technical crosshairs at intersections
      ctx.fillStyle = 'rgba(99, 102, 241, 0.14)';
      for (let x = gridSize * 2; x < w; x += gridSize * 4) {
        for (let y = gridSize * 2; y < h; y += gridSize * 4) {
          ctx.fillRect(x - 2, y, 5, 1);
          ctx.fillRect(x, y - 2, 1, 5);
        }
      }
      ctx.restore();

      // ── 2. Ambient Cursor Halo ────────────────────────────────────────
      const mouse = mouseRef.current;
      if (mouse.active) {
        const glowGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          240
        );
        glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
        glowGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.03)');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(mouse.x - 240, mouse.y - 240, 480, 480);
      }

      // ── 3. Physics & Node Movement ────────────────────────────────────
      const nodes = nodesRef.current;
      const speedMultiplier = prefersReducedMotion ? 0.05 : 1;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.pulsePhase += dt * 1.5;

        if (n.isOrganized && n.targetX !== undefined && n.targetY !== undefined) {
          // Smooth spring interpolation toward target cluster positions
          const dx = n.targetX - n.x;
          const dy = n.targetY - n.y;
          n.x += dx * (prefersReducedMotion ? 0.95 : 0.08);
          n.y += dy * (prefersReducedMotion ? 0.95 : 0.08);
        } else {
          // Organic drift
          n.x += n.vx * speedMultiplier;
          n.y += n.vy * speedMultiplier;

          // Bounce off boundaries with soft damping
          if (n.x < 30) { n.x = 30; n.vx *= -1; }
          if (n.x > w - 30) { n.x = w - 30; n.vx *= -1; }
          if (n.y < 30) { n.y = 30; n.vy *= -1; }
          if (n.y > h - 30) { n.y = h - 30; n.vy *= -1; }
        }

        // Cursor interaction (gentle repulsion)
        if (mouse.active) {
          const mdx = n.x - mouse.x;
          const mdy = n.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140 && mdist > 0) {
            const force = (1 - mdist / 140) * 1.5;
            n.x += (mdx / mdist) * force;
            n.y += (mdy / mdist) * force;
          }
        }
      }

      // ── 4. Connection Lines & Traveling Photons ───────────────────────
      const connectionThreshold = Math.min(w, h) * 0.22;
      ctx.lineWidth = 1;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const shouldConnect =
            (a.isOrganized && b.isOrganized && dist < connectionThreshold * 1.6) ||
            dist < connectionThreshold;

          if (shouldConnect) {
            const alpha = Math.max(0, 1 - dist / (connectionThreshold * 1.3)) * 0.25;
            const lineGrad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            lineGrad.addColorStop(0, a.color);
            lineGrad.addColorStop(1, b.color);

            ctx.strokeStyle = lineGrad;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            // Periodically spawn photons along connections
            if (!prefersReducedMotion && Math.random() < 0.0025 && photonsRef.current.length < 18) {
              photonsRef.current.push({
                fromNode: a,
                toNode: b,
                progress: 0,
                speed: 0.35 + Math.random() * 0.4,
                color: a.color,
              });
            }
          }
        }
      }

      ctx.globalAlpha = 1;

      // ── 5. Render Data Photons ────────────────────────────────────────
      const photons = photonsRef.current;
      for (let i = photons.length - 1; i >= 0; i--) {
        const p = photons[i];
        p.progress += dt * p.speed;

        if (p.progress >= 1) {
          photons.splice(i, 1);
          continue;
        }

        const px = p.fromNode.x + (p.toNode.x - p.fromNode.x) * p.progress;
        const py = p.fromNode.y + (p.toNode.y - p.fromNode.y) * p.progress;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 6. Render Nodes & High-Tech Labels ─────────────────────────────
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pulse = Math.sin(n.pulsePhase) * 0.3 + 1;
        const currentRadius = n.baseRadius * pulse;

        // Outer glow
        const glow = ctx.createRadialGradient(
          n.x,
          n.y,
          0,
          n.x,
          n.y,
          currentRadius * 4.2
        );
        glow.addColorStop(0, n.glowColor);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius * 4.2, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing radar ring on key root / major nodes
        if (n.type === 'root' || n.isOrganized) {
          ctx.strokeStyle = n.color;
          ctx.globalAlpha = (Math.sin(n.pulsePhase * 1.5) * 0.5 + 0.5) * 0.4;
          ctx.beginPath();
          ctx.arc(n.x, n.y, currentRadius * 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Solid core
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Bright white center dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(1, currentRadius * 0.35), 0, Math.PI * 2);
        ctx.fill();

        // High-tech typography label for named nodes
        if (n.label) {
          ctx.save();
          ctx.font = n.type === 'root' ? '600 13px system-ui, sans-serif' : '500 10.5px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          // Micro badge pill behind text for high legibility
          const textMetrics = ctx.measureText(n.label);
          const badgeWidth = textMetrics.width + 12;
          const badgeHeight = 18;
          const badgeX = n.x - badgeWidth / 2;
          const badgeY = n.y + currentRadius + 5;

          ctx.fillStyle = 'rgba(8, 11, 20, 0.85)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;

          // Rounded pill
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 9);
          ctx.fill();
          ctx.stroke();

          // Text content
          ctx.fillStyle = n.type === 'root' ? '#ffffff' : '#cbd5e1';
          ctx.fillText(n.label, n.x, badgeY + 3);
          ctx.restore();
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId.current = requestAnimationFrame(render);
      }
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [initCosmicNodes]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-90 transition-opacity duration-1000"
      />
    </div>
  );
}
