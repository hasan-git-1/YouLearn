'use client';

import React, { useEffect, useRef } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  pulsePhase: number;
}

export function KnowledgeUniverseCanvas({
  className = '',
}: {
  activeQuery?: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const isVisibleRef = useRef<boolean>(true);

  // Initialize exactly 10 subtle atmospheric nodes (within the strict 8–12 node specification)
  const initAtmosphericNodes = (width: number, height: number) => {
    const nodes: Node[] = [];
    const colors = [
      { main: '#818cf8', glow: 'rgba(129, 140, 248, 0.35)' },
      { main: '#06b6d4', glow: 'rgba(6, 182, 212, 0.30)' },
      { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.30)' },
      { main: '#6366f1', glow: 'rgba(99, 102, 241, 0.35)' },
      { main: '#94a3b8', glow: 'rgba(148, 163, 184, 0.20)' },
    ];

    const count = 10;
    for (let i = 0; i < count; i++) {
      const palette = colors[i % colors.length];
      const isLeft = i % 2 === 0;

      // Position nodes in outer quadrants, leaving central hero negative space clean
      const x = isLeft
        ? Math.random() * (width * 0.24) + 40
        : width - (Math.random() * (width * 0.24) + 40);
      const y = Math.random() * (height * 0.85) + 50;

      nodes.push({
        id: `node-${i}`,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        baseRadius: Math.random() * 1.0 + 1.8,
        color: palette.main,
        glowColor: palette.glow,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    nodesRef.current = nodes;
  };

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
        initAtmosphericNodes(w, h);
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

      // ── 1. Very Faint Technical Grid ──────────────────────────────────
      const gridSize = 80;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.012)';
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

      // ── 2. Hero Radial Atmospheric Lighting ───────────────────────────
      const heroCenterX = w / 2;
      const heroCenterY = h * 0.44;
      const heroRadius = Math.min(w, h) * 0.45;

      ctx.save();
      const bloom = ctx.createRadialGradient(
        heroCenterX,
        heroCenterY,
        0,
        heroCenterX,
        heroCenterY,
        heroRadius
      );
      bloom.addColorStop(0, 'rgba(99, 102, 241, 0.09)');
      bloom.addColorStop(0.4, 'rgba(6, 182, 212, 0.03)');
      bloom.addColorStop(1, 'transparent');
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // ── 3. Subtle Glowing Horizon / Curved Light Form ─────────────────
      const horizonY = h * 0.92;
      const horizonRadius = Math.max(w * 0.85, 800);
      ctx.save();

      // Soft glow beneath horizon
      const horizGlow = ctx.createRadialGradient(
        w / 2,
        horizonY + horizonRadius - 40,
        horizonRadius - 60,
        w / 2,
        horizonY + horizonRadius - 40,
        horizonRadius + 100
      );
      horizGlow.addColorStop(0, 'rgba(99, 102, 241, 0.20)');
      horizGlow.addColorStop(0.35, 'rgba(6, 182, 212, 0.06)');
      horizGlow.addColorStop(0.75, 'rgba(6, 8, 18, 0.7)');
      horizGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = horizGlow;
      ctx.beginPath();
      ctx.arc(w / 2, horizonY + horizonRadius - 40, horizonRadius + 100, Math.PI * 1.16, Math.PI * 1.84);
      ctx.fill();

      // Luminous rim line
      ctx.beginPath();
      ctx.arc(w / 2, horizonY + horizonRadius - 40, horizonRadius, Math.PI * 1.18, Math.PI * 1.82);
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // ── 4. Physics & Central Exclusion Zone ───────────────────────────
      const nodes = nodesRef.current;
      const speed = prefersReducedMotion ? 0.02 : 0.65;

      // Central exclusion zone: keeps nodes from overlapping the headline & search bar
      const zoneRadiusX = Math.min(w * 0.35, 420);
      const zoneRadiusY = 220;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.pulsePhase += dt * 1.2;

        n.x += n.vx * speed;
        n.y += n.vy * speed;

        // Central exclusion push
        const normDx = (n.x - heroCenterX) / zoneRadiusX;
        const normDy = (n.y - heroCenterY) / zoneRadiusY;
        const distSq = normDx * normDx + normDy * normDy;

        if (distSq < 1 && distSq > 0.001) {
          const pushFactor = (1 - Math.sqrt(distSq)) * 1.2;
          const pushAngle = Math.atan2(n.y - heroCenterY, n.x - heroCenterX);
          n.x += Math.cos(pushAngle) * pushFactor * 5;
          n.y += Math.sin(pushAngle) * pushFactor * 5;
        }

        // Soft bounce boundaries
        if (n.x < 30) { n.x = 30; n.vx *= -1; }
        if (n.x > w - 30) { n.x = w - 30; n.vx *= -1; }
        if (n.y < 30) { n.y = 30; n.vy *= -1; }
        if (n.y > h - 70) { n.y = h - 70; n.vy *= -1; }
      }

      // ── 5. Sparse Glowing Network Lines ───────────────────────────────
      const connectionDist = 160;
      ctx.lineWidth = 1;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.08;
            const lineGrad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            lineGrad.addColorStop(0, a.color);
            lineGrad.addColorStop(1, b.color);

            ctx.strokeStyle = lineGrad;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;

      // ── 6. Render Tiny Glowing Nodes (Zero Text Labels) ───────────────
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pulse = Math.sin(n.pulsePhase) * 0.2 + 1;
        const currentRadius = n.baseRadius * pulse;

        // Outer soft glow
        const glow = ctx.createRadialGradient(
          n.x,
          n.y,
          0,
          n.x,
          n.y,
          currentRadius * 3.5
        );
        glow.addColorStop(0, n.glowColor);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // White micro-center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(0.8, currentRadius * 0.35), 0, Math.PI * 2);
        ctx.fill();
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
  }, []);

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
