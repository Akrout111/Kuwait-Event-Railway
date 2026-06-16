"use client";

import { useRef, useEffect, useCallback, useSyncExternalStore } from "react";

/* ──────────────────────────────────────────────
   Color Constants — Luxury Gold & Navy Palette
   ────────────────────────────────────────────── */

const GOLD = "oklch(0.76 0.13 85)";
const GOLD_BRIGHT = "oklch(0.82 0.14 90)";
const NAVY = "oklch(0.15 0.03 260)";
const NAVY_DEEP = "oklch(0.10 0.02 260)";

/* ──────────────────────────────────────────────
   Deterministic PRNG — Mulberry32 seeded with 42
   ────────────────────────────────────────────── */

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ──────────────────────────────────────────────
   Particle Interface & Generation
   ────────────────────────────────────────────── */

interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  phase: number;
}

const PARTICLE_COUNT = 150;
const PRNG_SEED = 42;

function generateParticles(count: number): Particle[] {
  const rng = mulberry32(PRNG_SEED);
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: rng(),
      y: rng(),
      speed: 0.012 + rng() * 0.04,
      size: 1.5 + rng() * 3.5,
      opacity: 0.25 + rng() * 0.55,
      phase: rng() * Math.PI * 2,
    });
  }
  return particles;
}

const PARTICLES = generateParticles(PARTICLE_COUNT);

/* ──────────────────────────────────────────────
   Hexagonal Grid Configuration
   ────────────────────────────────────────────── */

const GRID_COLS = 8;
const GRID_ROWS = 6;
const HEX_RADIUS = 80;
const HEX_ROTATION_SPEED = 0.08;
const GRID_DEPTH_SPACING = 100;

function hexVertices3D(cx: number, cy: number, cz: number, radius: number): [number, number, number][] {
  const verts: [number, number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    verts.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle), cz]);
  }
  return verts;
}

function project3D(
  x: number, y: number, z: number,
  centerX: number, centerY: number,
  rotY: number, scale: number
): { px: number; py: number; depth: number } {
  const cosR = Math.cos(rotY);
  const sinR = Math.sin(rotY);
  const rx = x * cosR - z * sinR;
  const rz = x * sinR + z * cosR;
  const fov = 800;
  const depth = rz + fov + 500;
  const perspectiveFactor = fov / Math.max(depth, 1);
  return {
    px: centerX + rx * perspectiveFactor * scale,
    py: centerY + y * perspectiveFactor * scale,
    depth,
  };
}

/* ──────────────────────────────────────────────
   8-Pointed Star (Rub el Hizb) Drawing
   ────────────────────────────────────────────── */

function draw8PointedStar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number,
  rotation: number,
  opacity: number
): void {
  // Multiple glow layers for a luminous effect
  const glowLayers = [
    { scale: 1.25, alpha: opacity * 0.08 },
    { scale: 1.15, alpha: opacity * 0.15 },
    { scale: 1.06, alpha: opacity * 0.3 },
    { scale: 1.0, alpha: opacity },
  ];

  for (const layer of glowLayers) {
    const r = radius * layer.scale;
    const alpha = layer.alpha;

    ctx.strokeStyle = `oklch(0.76 0.13 85 / ${Math.min(alpha, 1)})`;
    ctx.lineWidth = layer.scale > 1.1 ? 0.8 : layer.scale > 1.04 ? 1.2 : 2;

    // Square 1
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = rotation + (Math.PI / 2) * i;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // Square 2 (rotated 45°)
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = rotation + Math.PI / 4 + (Math.PI / 2) * i;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Center glow
  const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.3);
  centerGlow.addColorStop(0, `oklch(0.82 0.14 90 / ${opacity * 0.15})`);
  centerGlow.addColorStop(1, `oklch(0.76 0.13 85 / 0)`);
  ctx.fillStyle = centerGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

/* ──────────────────────────────────────────────
   Light Rays Drawing
   Diagonal light streaks creating volumetric depth
   ────────────────────────────────────────────── */

function drawLightRays(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  time: number
): void {
  const rays = 6;
  const centerX = width * 0.5;
  const centerY = height * 0.4;

  for (let i = 0; i < rays; i++) {
    const baseAngle = (Math.PI * 2 / rays) * i + time * 0.02;
    const rayLength = Math.max(width, height) * 0.8;
    const rayWidth = 30 + Math.sin(time * 0.3 + i * 1.2) * 15;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(baseAngle);

    const gradient = ctx.createLinearGradient(0, 0, rayLength, 0);
    gradient.addColorStop(0, `oklch(0.76 0.13 85 / 0.04)`);
    gradient.addColorStop(0.3, `oklch(0.76 0.13 85 / 0.02)`);
    gradient.addColorStop(1, `oklch(0.76 0.13 85 / 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, -rayWidth / 2);
    ctx.lineTo(rayLength, -rayWidth * 0.1);
    ctx.lineTo(rayLength, rayWidth * 0.1);
    ctx.lineTo(0, rayWidth / 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

/* ──────────────────────────────────────────────
   Nebula Glow Drawing
   Soft, large-scale gradient washes for atmosphere
   ────────────────────────────────────────────── */

function drawNebulaGlow(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  time: number,
  mouseX: number, mouseY: number
): void {
  // Gold nebula spot 1 (drifting)
  const nebula1X = width * (0.25 + Math.sin(time * 0.05) * 0.08);
  const nebula1Y = height * (0.35 + Math.cos(time * 0.04) * 0.06);
  const nebula1R = Math.max(width, height) * 0.4;
  const nebula1 = ctx.createRadialGradient(nebula1X, nebula1Y, 0, nebula1X, nebula1Y, nebula1R);
  nebula1.addColorStop(0, `oklch(0.76 0.13 85 / 0.06)`);
  nebula1.addColorStop(0.5, `oklch(0.76 0.13 85 / 0.02)`);
  nebula1.addColorStop(1, `oklch(0.76 0.13 85 / 0)`);
  ctx.fillStyle = nebula1;
  ctx.fillRect(0, 0, width, height);

  // Navy nebula spot 2
  const nebula2X = width * (0.75 + Math.cos(time * 0.06) * 0.06);
  const nebula2Y = height * (0.6 + Math.sin(time * 0.05) * 0.05);
  const nebula2R = Math.max(width, height) * 0.35;
  const nebula2 = ctx.createRadialGradient(nebula2X, nebula2Y, 0, nebula2X, nebula2Y, nebula2R);
  nebula2.addColorStop(0, `oklch(0.20 0.04 260 / 0.08)`);
  nebula2.addColorStop(0.5, `oklch(0.15 0.03 260 / 0.03)`);
  nebula2.addColorStop(1, `oklch(0.15 0.03 260 / 0)`);
  ctx.fillStyle = nebula2;
  ctx.fillRect(0, 0, width, height);

  // Mouse-interactive gold glow
  const mouseGlowX = mouseX * width;
  const mouseGlowY = mouseY * height;
  const mouseGlowR = Math.max(width, height) * 0.3;
  const mouseGlow = ctx.createRadialGradient(mouseGlowX, mouseGlowY, 0, mouseGlowX, mouseGlowY, mouseGlowR);
  mouseGlow.addColorStop(0, `oklch(0.76 0.13 85 / 0.05)`);
  mouseGlow.addColorStop(0.4, `oklch(0.76 0.13 85 / 0.02)`);
  mouseGlow.addColorStop(1, `oklch(0.76 0.13 85 / 0)`);
  ctx.fillStyle = mouseGlow;
  ctx.fillRect(0, 0, width, height);
}

/* ──────────────────────────────────────────────
   Reduced-motion detection hook
   ────────────────────────────────────────────── */

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

/* ──────────────────────────────────────────────
   Hero3DScene — Enhanced Interactive 3D Hero
   ────────────────────────────────────────────── */

interface Hero3DSceneProps {
  scrollProgress: number;
  mouseX: number;
  mouseY: number;
}

export function Hero3DScene({ scrollProgress, mouseX, mouseY }: Hero3DSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const scrollProgressRef = useRef(scrollProgress);
  const mouseXRef = useRef(mouseX);
  const mouseYRef = useRef(mouseY);

  useEffect(() => { scrollProgressRef.current = scrollProgress; }, [scrollProgress]);
  useEffect(() => { mouseXRef.current = mouseX; }, [mouseX]);
  useEffect(() => { mouseYRef.current = mouseY; }, [mouseY]);

  const render = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) => {
    const scroll = scrollProgressRef.current;
    const mx = mouseXRef.current;
    const my = mouseYRef.current;

    // ── Clear with gradient background ──
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, NAVY_DEEP);
    bgGrad.addColorStop(0.5, NAVY);
    bgGrad.addColorStop(1, NAVY_DEEP);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // ── Scroll-driven effects ──
    const zoomScale = 1.0 + scroll * 0.5;
    const starRotationMultiplier = 1.0 + scroll * 2.0;

    const centerX = width / 2;
    const centerY = height / 2;

    // ════════════════════════════════════════════
    // LAYER 0: Nebula Glow (atmospheric depth)
    // ════════════════════════════════════════════
    drawNebulaGlow(ctx, width, height, time, mx, my);

    // ════════════════════════════════════════════
    // LAYER 1: Light Rays (volumetric depth)
    // ════════════════════════════════════════════
    drawLightRays(ctx, width, height, time);

    // ════════════════════════════════════════════
    // LAYER 2: Hexagonal Wireframe Grid
    // ════════════════════════════════════════════

    const rotY = time * HEX_ROTATION_SPEED;
    const gridWidth = (GRID_COLS - 1) * HEX_RADIUS * 1.75;
    const gridHeight = (GRID_ROWS - 1) * HEX_RADIUS * 1.5;
    const gridStartX = -gridWidth / 2;
    const gridStartY = -gridHeight / 2;

    const hexEdges: { x1: number; y1: number; x2: number; y2: number; avgDepth: number }[] = [];

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const offsetX = row % 2 === 1 ? HEX_RADIUS * 0.875 : 0;
        const hx = gridStartX + col * HEX_RADIUS * 1.75 + offsetX;
        const hy = gridStartY + row * HEX_RADIUS * 1.5;
        const hz = row * GRID_DEPTH_SPACING;

        const verts3D = hexVertices3D(hx, hy, hz, HEX_RADIUS);
        const projected = verts3D.map(([vx, vy, vz]) =>
          project3D(vx, vy, vz, centerX, centerY, rotY, zoomScale)
        );

        for (let i = 0; i < 6; i++) {
          const next = (i + 1) % 6;
          hexEdges.push({
            x1: projected[i].px,
            y1: projected[i].py,
            x2: projected[next].px,
            y2: projected[next].py,
            avgDepth: (projected[i].depth + projected[next].depth) / 2,
          });
        }
      }
    }

    hexEdges.sort((a, b) => b.avgDepth - a.avgDepth);

    const depths = hexEdges.map((e) => e.avgDepth);
    const minDepth = Math.min(...depths);
    const maxDepth = Math.max(...depths);
    const depthRange = Math.max(maxDepth - minDepth, 1);

    for (const edge of hexEdges) {
      const normalizedDepth = 1 - (edge.avgDepth - minDepth) / depthRange;
      const lineOpacity = 0.06 + normalizedDepth * 0.20; // 6-26% opacity (stronger than before)
      ctx.strokeStyle = `oklch(0.76 0.13 85 / ${lineOpacity})`;
      ctx.lineWidth = 0.5 + normalizedDepth * 1.5;
      ctx.beginPath();
      ctx.moveTo(edge.x1, edge.y1);
      ctx.lineTo(edge.x2, edge.y2);
      ctx.stroke();
    }

    // ════════════════════════════════════════════
    // LAYER 3: 8-Pointed Star (Rub el Hizb)
    // ════════════════════════════════════════════

    const starRadius = Math.min(width, height) * 0.2;
    const starRotation = time * 0.05 * starRotationMultiplier;
    draw8PointedStar(ctx, centerX, centerY, starRadius, starRotation, 0.35);

    // ════════════════════════════════════════════
    // LAYER 4: Gold Particle System
    // ════════════════════════════════════════════

    const particlePositions: { px: number; py: number; size: number; opacity: number }[] = [];

    for (const p of PARTICLES) {
      let py = p.y - (time * p.speed) % 1;
      if (py < 0) py += 1;

      const oscillation = Math.sin(time * 0.5 + p.phase) * 0.015;
      const px = p.x + oscillation;

      const screenX = px * width;
      const screenY = py * height;

      const pulseFactor = 1 + Math.sin(time * 2 + p.phase) * 0.2;
      const displaySize = p.size * pulseFactor;

      particlePositions.push({ px: screenX, py: screenY, size: displaySize, opacity: p.opacity });

      // Draw particle with large glow
      const gradient = ctx.createRadialGradient(
        screenX, screenY, 0,
        screenX, screenY, displaySize * 4
      );
      gradient.addColorStop(0, `oklch(0.82 0.14 90 / ${p.opacity})`);
      gradient.addColorStop(0.3, `oklch(0.76 0.13 85 / ${p.opacity * 0.6})`);
      gradient.addColorStop(0.6, `oklch(0.76 0.13 85 / ${p.opacity * 0.15})`);
      gradient.addColorStop(1, `oklch(0.76 0.13 85 / 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, displaySize * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // ════════════════════════════════════════════
    // LAYER 5: Connecting Lines (Constellation)
    // ════════════════════════════════════════════

    const CONNECTION_DISTANCE = 120;

    for (let i = 0; i < particlePositions.length; i++) {
      for (let j = i + 1; j < particlePositions.length; j++) {
        const a = particlePositions[i];
        const b = particlePositions[j];
        const dx = a.px - b.px;
        const dy = a.py - b.py;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const distFactor = 1 - dist / CONNECTION_DISTANCE;
          const lineOpacity = distFactor * 0.08; // 8% max (stronger than before)
          ctx.strokeStyle = `oklch(0.76 0.13 85 / ${lineOpacity})`;
          ctx.lineWidth = 0.5 + distFactor;
          ctx.beginPath();
          ctx.moveTo(a.px, a.py);
          ctx.lineTo(b.px, b.py);
          ctx.stroke();
        }
      }
    }

    // ════════════════════════════════════════════
    // LAYER 6: Mouse-Following Light
    // ════════════════════════════════════════════

    const lightX = mx * width;
    const lightY = my * height;
    const lightRadius = 350;

    const lightGradient = ctx.createRadialGradient(
      lightX, lightY, 0,
      lightX, lightY, lightRadius
    );
    lightGradient.addColorStop(0, `oklch(0.76 0.13 85 / 0.12)`);
    lightGradient.addColorStop(0.3, `oklch(0.76 0.13 85 / 0.06)`);
    lightGradient.addColorStop(0.6, `oklch(0.76 0.13 85 / 0.02)`);
    lightGradient.addColorStop(1, `oklch(0.76 0.13 85 / 0)`);

    ctx.fillStyle = lightGradient;
    ctx.fillRect(0, 0, width, height);

    // ════════════════════════════════════════════
    // LAYER 7: Depth fog at edges
    // ════════════════════════════════════════════

    // Top vignette
    const topVig = ctx.createLinearGradient(0, 0, 0, height * 0.25);
    topVig.addColorStop(0, `oklch(0.10 0.02 260 / 0.3)`);
    topVig.addColorStop(1, `oklch(0.10 0.02 260 / 0)`);
    ctx.fillStyle = topVig;
    ctx.fillRect(0, 0, width, height * 0.25);

    // Bottom vignette
    const bottomVig = ctx.createLinearGradient(0, height * 0.75, 0, height);
    bottomVig.addColorStop(0, `oklch(0.10 0.02 260 / 0)`);
    bottomVig.addColorStop(1, `oklch(0.10 0.02 260 / 0.4)`);
    ctx.fillStyle = bottomVig;
    ctx.fillRect(0, height * 0.75, width, height * 0.25);

    // Side vignettes
    const leftVig = ctx.createLinearGradient(0, 0, width * 0.15, 0);
    leftVig.addColorStop(0, `oklch(0.10 0.02 260 / 0.25)`);
    leftVig.addColorStop(1, `oklch(0.10 0.02 260 / 0)`);
    ctx.fillStyle = leftVig;
    ctx.fillRect(0, 0, width * 0.15, height);

    const rightVig = ctx.createLinearGradient(width, 0, width * 0.85, 0);
    rightVig.addColorStop(0, `oklch(0.10 0.02 260 / 0.25)`);
    rightVig.addColorStop(1, `oklch(0.10 0.02 260 / 0)`);
    ctx.fillStyle = rightVig;
    ctx.fillRect(width * 0.85, 0, width * 0.15, height);

  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    resizeObserver.observe(canvas);

    if (prefersReducedMotion) {
      const rect = canvas.getBoundingClientRect();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(ctx, rect.width, rect.height, 0);
      return () => { resizeObserver.disconnect(); };
    }

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const rect = canvas.getBoundingClientRect();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(ctx, rect.width, rect.height, elapsed);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startTimeRef.current = null;
      resizeObserver.disconnect();
    };
  }, [prefersReducedMotion, render]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
}
