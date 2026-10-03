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

  // Initialize refined, lower-density cosmic nodes (45% reduction, zero text labels by default)
  const initCosmicNodes = useCallback((width: number, height: number) => {
    const nodes: Node[] = [];
    const colors = {
      course: { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)' },
      video: { main: '#06b6d4', glow: 'rgba(6, 182, 212, 0.45)' },
      podcast: { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.45)' },
      creator: { main: '#10b981', glow: 'rgba(16, 185, 129, 0.45)' },
      concept: { main: '#6366f1', glow: 'rgba(99, 102, 241, 0.45)' },
      particle: { main: '#94a3b8', glow: 'rgba(148, 163, 184, 0.2)' },
    };

    // Major peripheral orbs (only 8 major orbs positioned around the outer canvas)
    const types: ('course' | 'video' | 'podcast' | 'creator' | 'concept')[] = [
      'course', 'video', 'concept', 'creator', 'podcast', 'video', 'course', 'concept'
    ];

    types.forEach((t, i) => {
      const palette = colors[t];
      const angle = (i / types.length) * Math.PI * 2 + 0.3;
      // Position them in the outer margins of the screen, away from the hero center
      const dist = Math.min(width, height) * 0.42;
      const cx = width / 2;
      const cy = height * 0.48;

      nodes.push({
        id: `major-${i}`,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist * 0.78,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        baseRadius: Math.random() * 2 + 4,
        radius: 4.5,
        color: palette.main,
        glowColor: palette.glow,
        label: '', // No default text label in cosmic mode — extreme clarity!
        type: t,
        pulsePhase: Math.random() * Math.PI * 2,
        clusterId: i % 4,
      });
    });

    // Secondary ambient connective nodes (only ~12 nodes)
    const ambientCount = 12;
    for (let i = 0; i < ambientCount; i++) {
      const t = i % 2 === 0 ? 'concept' : 'video';
      const palette = colors[t];

      // Spawn in outer quadrants, avoiding hero center
      const isLeft = i % 2 === 0;
      const rx = isLeft
        ? Math.random() * (width * 0.28) + 40
        : width - (Math.random() * (width * 0.28) + 40);
      const ry = Math.random() * (height * 0.85) + 40;

      nodes.push({
        id: `ambient-${i}`,
        x: rx,
        y: ry,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
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

  // Reorganize nodes into structured semantic constellation when topic is actively searched
  const organizeGraph = useCallback(
    (preset: KnowledgeGraphTopic, width: number, height: number) => {
      const nodes = nodesRef.current;
      if (!nodes.length) return;

      const cx = width / 2;
      const cy = height * 0.44;

      // Node 0 is the root node
      if (nodes[0]) {
        nodes[0].targetX = cx;
        nodes[0].targetY = cy;
        nodes[0].isOrganized = true;
        nodes[0].label = preset.root;
        nodes[0].type = 'root';
        nodes[0].color = '#6366f1';
        nodes[0].glowColor = 'rgba(99, 102, 241, 0.9)';
        nodes[0].baseRadius = 7;
      }

      const branchCount = preset.branches.length;
      let nodeIdx = 1;

      preset.branches.forEach((branch, bIdx) => {
        const branchAngle = (bIdx / branchCount) * Math.PI * 2 - Math.PI / 2;
        const branchDist = Math.min(width, height) * 0.28;
        const bx = cx + Math.cos(branchAngle) * branchDist;
        const by = cy + Math.sin(branchAngle) * branchDist * 0.82;

        if (nodes[nodeIdx]) {
          nodes[nodeIdx].targetX = bx;
          nodes[nodeIdx].targetY = by;
          nodes[nodeIdx].isOrganized = true;
          nodes[nodeIdx].label = branch.name;
          nodes[nodeIdx].type = branch.type;
          nodes[nodeIdx].baseRadius = 5.5;
          nodeIdx++;
        }

        if (branch.children) {
          branch.children.forEach((childName, cIdx) => {
            if (nodes[nodeIdx]) {
              const spread = (cIdx - (branch.children!.length - 1) / 2) * 0.45;
              const leafAngle = branchAngle + spread;
              const leafDist = branchDist + Math.min(width, height) * 0.13;
              nodes[nodeIdx].targetX = cx + Math.cos(leafAngle) * leafDist;
              nodes[nodeIdx].targetY = cy + Math.sin(leafAngle) * leafDist * 0.82;
              nodes[nodeIdx].isOrganized = true;
              nodes[nodeIdx].label = childName;
              nodes[nodeIdx].type = 'concept';
              nodes[nodeIdx].baseRadius = 3;
              nodeIdx++;
            }
          });
        }
      });

      for (let i = nodeIdx; i < nodes.length; i++) {
        nodes[i].isOrganized = false;
        nodes[i].targetX = undefined;
        nodes[i].targetY = undefined;
        nodes[i].label = '';
      }
    },
    []
  );

  // Reset graph back to ambient drift (clear all labels)
  const relaxGraph = useCallback(() => {
    nodesRef.current.forEach((n) => {
      n.isOrganized = false;
      n.targetX = undefined;
      n.targetY = undefined;
      n.label = '';
      n.baseRadius = n.type === 'particle' ? 2 : 4;
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

      // ── 1. Soft Subtle Technical Grid ──────────────────────────────────
      const gridSize = 72;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.016)';
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
      ctx.restore();

      // ── 2. Celestial Horizon Arc (Bottom of Hero) ──────────────────────
      const horizonY = h * 0.94;
      const horizonRadius = Math.max(w * 0.85, 800);
      ctx.save();
      // Glow under celestial horizon
      const horizGlow = ctx.createRadialGradient(
        w / 2,
        horizonY + horizonRadius - 40,
        horizonRadius - 80,
        w / 2,
        horizonY + horizonRadius - 40,
        horizonRadius + 120
      );
      horizGlow.addColorStop(0, 'rgba(99, 102, 241, 0.28)');
      horizGlow.addColorStop(0.3, 'rgba(6, 182, 212, 0.10)');
      horizGlow.addColorStop(0.7, 'rgba(8, 11, 20, 0.85)');
      horizGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = horizGlow;
      ctx.beginPath();
      ctx.arc(w / 2, horizonY + horizonRadius - 40, horizonRadius + 120, Math.PI * 1.15, Math.PI * 1.85);
      ctx.fill();

      // Luminous rim line
      ctx.beginPath();
      ctx.arc(w / 2, horizonY + horizonRadius - 40, horizonRadius, Math.PI * 1.18, Math.PI * 1.82);
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // ── 3. Ambient Cursor Halo ─────────────────────────────────────────
      const mouse = mouseRef.current;
      if (mouse.active) {
        const glowGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          200
        );
        glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.06)');
        glowGrad.addColorStop(0.6, 'rgba(6, 182, 212, 0.02)');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(mouse.x - 200, mouse.y - 200, 400, 400);
      }

      // ── 4. Physics & Node Movement with Hero Exclusion Zone ────────────
      const nodes = nodesRef.current;
      const speedMultiplier = prefersReducedMotion ? 0.04 : 0.75;

      // Central exclusion zone: keeps nodes from passing through headline & search bar
      const heroCenterX = w / 2;
      const heroCenterY = h * 0.44;
      const zoneRadiusX = Math.min(w * 0.36, 420);
      const zoneRadiusY = 220;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.pulsePhase += dt * 1.2;

        if (n.isOrganized && n.targetX !== undefined && n.targetY !== undefined) {
          const dx = n.targetX - n.x;
          const dy = n.targetY - n.y;
          n.x += dx * (prefersReducedMotion ? 0.95 : 0.08);
          n.y += dy * (prefersReducedMotion ? 0.95 : 0.08);
        } else {
          n.x += n.vx * speedMultiplier;
          n.y += n.vy * speedMultiplier;

          // Hero Exclusion Zone repulsion (preserves extreme clarity for typography)
          const normDx = (n.x - heroCenterX) / zoneRadiusX;
          const normDy = (n.y - heroCenterY) / zoneRadiusY;
          const distSq = normDx * normDx + normDy * normDy;

          if (distSq < 1 && distSq > 0.001) {
            const pushFactor = (1 - Math.sqrt(distSq)) * 1.4;
            const pushAngle = Math.atan2(n.y - heroCenterY, n.x - heroCenterX);
            n.x += Math.cos(pushAngle) * pushFactor * 6;
            n.y += Math.sin(pushAngle) * pushFactor * 6;
          }

          // Soft bounce boundaries
          if (n.x < 40) { n.x = 40; n.vx *= -1; }
          if (n.x > w - 40) { n.x = w - 40; n.vx *= -1; }
          if (n.y < 40) { n.y = 40; n.vy *= -1; }
          if (n.y > h - 80) { n.y = h - 80; n.vy *= -1; }
        }

        // Gentle cursor magnetic repulsion
        if (mouse.active) {
          const mdx = n.x - mouse.x;
          const mdy = n.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 130 && mdist > 0) {
            const force = (1 - mdist / 130) * 1.2;
            n.x += (mdx / mdist) * force;
            n.y += (mdy / mdist) * force;
          }
        }
      }

      // ── 5. Fine Connection Lines & Travelling Photons ──────────────────
      const connectionThreshold = Math.min(w, h) * 0.26;
      ctx.lineWidth = 1;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const shouldConnect =
            (a.isOrganized && b.isOrganized && dist < connectionThreshold * 1.4) ||
            dist < connectionThreshold;

          if (shouldConnect) {
            const alpha = Math.max(0, 1 - dist / (connectionThreshold * 1.2)) * 0.18;
            const lineGrad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            lineGrad.addColorStop(0, a.color);
            lineGrad.addColorStop(1, b.color);

            ctx.strokeStyle = lineGrad;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            // Photons
            if (!prefersReducedMotion && Math.random() < 0.002 && photonsRef.current.length < 10) {
              photonsRef.current.push({
                fromNode: a,
                toNode: b,
                progress: 0,
                speed: 0.35 + Math.random() * 0.3,
                color: a.color,
              });
            }
          }
        }
      }

      ctx.globalAlpha = 1;

      // ── 6. Render Data Photons ─────────────────────────────────────────
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
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 7. Render Glowing Nodes & Organized Labels ─────────────────────
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pulse = Math.sin(n.pulsePhase) * 0.25 + 1;
        const currentRadius = n.baseRadius * pulse;

        // Outer glow
        const glow = ctx.createRadialGradient(
          n.x,
          n.y,
          0,
          n.x,
          n.y,
          currentRadius * 3.8
        );
        glow.addColorStop(0, n.glowColor);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius * 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing radar ring on key cluster or organized nodes
        if (n.type === 'root' || n.isOrganized) {
          ctx.strokeStyle = n.color;
          ctx.globalAlpha = (Math.sin(n.pulsePhase * 1.4) * 0.5 + 0.5) * 0.35;
          ctx.beginPath();
          ctx.arc(n.x, n.y, currentRadius * 2.8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Solid core
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Center white dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(1, currentRadius * 0.3), 0, Math.PI * 2);
        ctx.fill();

        // ONLY draw text label if the graph is currently in organized query mode!
        // This guarantees zero background clutter in standard cosmic idle state.
        if (n.isOrganized && n.label) {
          ctx.save();
          ctx.font = n.type === 'root' ? '600 12.5px system-ui, sans-serif' : '500 10px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          const textMetrics = ctx.measureText(n.label);
          const badgeWidth = textMetrics.width + 12;
          const badgeHeight = 18;
          const badgeX = n.x - badgeWidth / 2;
          const badgeY = n.y + currentRadius + 5;

          ctx.fillStyle = 'rgba(8, 11, 20, 0.90)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 9);
          ctx.fill();
          ctx.stroke();

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
