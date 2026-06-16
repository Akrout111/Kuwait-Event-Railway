"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from "framer-motion";

// ─── Deterministic Shape Configs ─────────────────────────────
type ShapeType = "cube" | "octahedron" | "ring" | "diamond" | "sphere";

interface ShapeConfig {
  type: ShapeType;
  size: number;
  x: string;
  y: string;
  delay: number;
  floatDuration: number;
  rotateDuration: number;
  depth: number;
}

const SHAPE_CONFIGS: ShapeConfig[] = [
  { type: "cube", size: 60, x: "10%", y: "15%", delay: 0, floatDuration: 8, rotateDuration: 40, depth: 0.8 },
  { type: "ring", size: 80, x: "85%", y: "25%", delay: 1.5, floatDuration: 10, rotateDuration: 55, depth: 0.6 },
  { type: "diamond", size: 40, x: "70%", y: "70%", delay: 0.8, floatDuration: 12, rotateDuration: 35, depth: 1.0 },
  { type: "octahedron", size: 50, x: "20%", y: "60%", delay: 2.2, floatDuration: 9, rotateDuration: 45, depth: 0.5 },
  { type: "ring", size: 45, x: "50%", y: "30%", delay: 1.0, floatDuration: 11, rotateDuration: 60, depth: 0.7 },
  { type: "cube", size: 35, x: "90%", y: "55%", delay: 0.5, floatDuration: 7, rotateDuration: 50, depth: 0.9 },
  { type: "sphere", size: 55, x: "35%", y: "80%", delay: 1.8, floatDuration: 13, rotateDuration: 42, depth: 0.4 },
  { type: "diamond", size: 30, x: "5%", y: "45%", delay: 0.3, floatDuration: 9, rotateDuration: 38, depth: 0.75 },
  { type: "octahedron", size: 45, x: "60%", y: "10%", delay: 1.2, floatDuration: 11, rotateDuration: 48, depth: 0.65 },
  { type: "sphere", size: 35, x: "75%", y: "85%", delay: 2.0, floatDuration: 10, rotateDuration: 52, depth: 0.55 },
];

// ─── Reduced Motion Detection (SSR-safe) ─────────────────────
const reducedMotionQuery =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

function subscribeReducedMotion(callback: () => void) {
  const mql = reducedMotionQuery;
  if (!mql) return () => {};
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return reducedMotionQuery?.matches ?? false;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

// ─── Theme Detection (SSR-safe) ──────────────────────────────
const themeQuery =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

function subscribeTheme(callback: () => void) {
  const mql = themeQuery;
  if (!mql) return () => {};
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getThemeSnapshot(): boolean {
  // Check for dark class on html element (common pattern with next-themes)
  if (typeof document !== "undefined") {
    const html = document.documentElement;
    if (html.classList.contains("dark")) return true;
    if (html.classList.contains("light")) return false;
  }
  return themeQuery?.matches ?? false;
}

function getThemeServerSnapshot(): boolean {
  return false;
}

function useIsDark(): boolean {
  return useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
}

// ─── Component Props ─────────────────────────────────────────
interface FloatingShapes3DProps {
  /** Number of shapes to render (default: 6) */
  count?: number;
  /** Maximum shape size in px (default: 80) */
  maxSize?: number;
  /** Mouse parallax intensity 0-1 (default: 0.3) */
  mouseIntensity?: number;
  /** Scroll parallax intensity 0-1 (default: 0.2) */
  scrollIntensity?: number;
  /** Opacity of shapes 0-1 (default: 0.15) */
  opacity?: number;
  /** Additional class names for the container */
  className?: string;
}

// ─── Color Utilities ─────────────────────────────────────────
function getShapeFaceColor(isDark: boolean, index: number): string {
  // Vary opacity slightly per face for depth
  const baseOpacities = [0.08, 0.1, 0.06, 0.12, 0.09, 0.07, 0.11, 0.05];
  const opacity = baseOpacities[index % baseOpacities.length];
  const maxOpacity = isDark ? 0.12 : 0.15;
  const adjustedOpacity = Math.min(opacity, maxOpacity);
  return `oklch(0.76 0.13 85 / ${adjustedOpacity})`;
}

function getShapeBorderColor(isDark: boolean, index: number): string {
  const baseOpacities = [0.1, 0.12, 0.08, 0.15, 0.11, 0.09, 0.13, 0.07];
  const opacity = baseOpacities[index % baseOpacities.length];
  const maxOpacity = isDark ? 0.12 : 0.15;
  const adjustedOpacity = Math.min(opacity, maxOpacity);
  return `oklch(0.76 0.13 85 / ${adjustedOpacity})`;
}

// ─── Cube Shape ──────────────────────────────────────────────
function CubeShape({ size, isDark, faceIndex }: { size: number; isDark: boolean; faceIndex: number }) {
  const half = size / 2;
  const faces = [
    { label: "front", transform: `translateZ(${half}px)` },
    { label: "back", transform: `rotateY(180deg) translateZ(${half}px)` },
    { label: "right", transform: `rotateY(90deg) translateZ(${half}px)` },
    { label: "left", transform: `rotateY(-90deg) translateZ(${half}px)` },
    { label: "top", transform: `rotateX(90deg) translateZ(${half}px)` },
    { label: "bottom", transform: `rotateX(-90deg) translateZ(${half}px)` },
  ];

  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        transformStyle: "preserve-3d",
      }}
    >
      {faces.map((face, i) => (
        <div
          key={face.label}
          style={{
            position: "absolute",
            width: size,
            height: size,
            transform: face.transform,
            backfaceVisibility: "hidden",
            backgroundColor: getShapeFaceColor(isDark, faceIndex + i),
            border: `1px solid ${getShapeBorderColor(isDark, faceIndex + i)}`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Octahedron Shape (4 diamond faces) ──────────────────────
function OctahedronShape({ size, isDark, faceIndex }: { size: number; isDark: boolean; faceIndex: number }) {
  const half = size / 2;
  const sqrt2half = half * Math.SQRT2;

  // 8 triangular faces approximated as 4 diamond-shaped faces
  const faces = [
    { label: "top-front", transform: `rotateX(30deg) translateZ(${half * 0.6}px)` },
    { label: "top-back", transform: `rotateX(-30deg) translateZ(${half * 0.6}px)` },
    { label: "left", transform: `rotateY(90deg) rotateX(30deg) translateZ(${half * 0.6}px)` },
    { label: "right", transform: `rotateY(-90deg) rotateX(30deg) translateZ(${half * 0.6}px)` },
    { label: "bottom-front", transform: `rotateX(150deg) translateZ(${half * 0.6}px)` },
    { label: "bottom-back", transform: `rotateX(-150deg) translateZ(${half * 0.6}px)` },
    { label: "bottom-left", transform: `rotateY(90deg) rotateX(-30deg) translateZ(${half * 0.6}px)` },
    { label: "bottom-right", transform: `rotateY(-90deg) rotateX(-30deg) translateZ(${half * 0.6}px)` },
  ];

  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        transformStyle: "preserve-3d",
      }}
    >
      {faces.map((face, i) => (
        <div
          key={face.label}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 0,
            height: 0,
            transform: `translate(-50%, -50%) ${face.transform}`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Triangle using CSS borders */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${sqrt2half * 0.5}px solid transparent`,
              borderRight: `${sqrt2half * 0.5}px solid transparent`,
              borderBottom: `${sqrt2half}px solid ${getShapeFaceColor(isDark, faceIndex + i)}`,
              opacity: 1,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Ring Shape ──────────────────────────────────────────────
function RingShape({ size, isDark, faceIndex }: { size: number; isDark: boolean; faceIndex: number }) {
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        transformStyle: "preserve-3d",
        transform: "rotateX(75deg)",
      }}
    >
      {/* Main ring */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `${Math.max(2, size * 0.06)}px solid ${getShapeBorderColor(isDark, faceIndex)}`,
          backgroundColor: "transparent",
          position: "absolute",
        }}
      />
      {/* Inner ring for depth */}
      <div
        style={{
          width: size * 0.7,
          height: size * 0.7,
          borderRadius: "50%",
          border: `${Math.max(1, size * 0.03)}px solid ${getShapeBorderColor(isDark, faceIndex + 1)}`,
          backgroundColor: "transparent",
          position: "absolute",
          top: "15%",
          left: "15%",
        }}
      />
      {/* Subtle fill */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: getShapeFaceColor(isDark, faceIndex + 2),
          position: "absolute",
        }}
      />
    </div>
  );
}

// ─── Diamond Shape ───────────────────────────────────────────
function DiamondShape({ size, isDark, faceIndex }: { size: number; isDark: boolean; faceIndex: number }) {
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Front face */}
      <div
        style={{
          width: size * 0.7,
          height: size * 0.7,
          transform: "rotateZ(45deg) translateZ(2px)",
          border: `1px solid ${getShapeBorderColor(isDark, faceIndex)}`,
          backgroundColor: getShapeFaceColor(isDark, faceIndex),
          position: "absolute",
          top: "15%",
          left: "15%",
          backfaceVisibility: "hidden",
        }}
      />
      {/* Back face */}
      <div
        style={{
          width: size * 0.7,
          height: size * 0.7,
          transform: "rotateZ(45deg) rotateY(180deg) translateZ(2px)",
          border: `1px solid ${getShapeBorderColor(isDark, faceIndex + 1)}`,
          backgroundColor: getShapeFaceColor(isDark, faceIndex + 1),
          position: "absolute",
          top: "15%",
          left: "15%",
          backfaceVisibility: "hidden",
        }}
      />
    </div>
  );
}

// ─── Sphere Shape ────────────────────────────────────────────
function SphereShape({ size, isDark, faceIndex }: { size: number; isDark: boolean; faceIndex: number }) {
  const rings = [
    { rotation: "rotateX(0deg)", opacity: 0.8 },
    { rotation: "rotateX(60deg)", opacity: 0.5 },
    { rotation: "rotateX(120deg)", opacity: 0.3 },
    { rotation: "rotateY(90deg)", opacity: 0.6 },
  ];

  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Subtle sphere fill */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: getShapeFaceColor(isDark, faceIndex),
          position: "absolute",
        }}
      />
      {/* Latitude/longitude rings for 3D effect */}
      {rings.map((ring, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            border: `${Math.max(1, size * 0.025)}px solid ${getShapeBorderColor(isDark, faceIndex + i + 1)}`,
            backgroundColor: "transparent",
            position: "absolute",
            transform: `${ring.rotation}`,
            opacity: ring.opacity,
          }}
        />
      ))}
    </div>
  );
}

// ─── Shape Renderer ──────────────────────────────────────────
function ShapeContent({
  type,
  size,
  isDark,
  faceIndex,
}: {
  type: ShapeType;
  size: number;
  isDark: boolean;
  faceIndex: number;
}) {
  switch (type) {
    case "cube":
      return <CubeShape size={size} isDark={isDark} faceIndex={faceIndex} />;
    case "octahedron":
      return <OctahedronShape size={size} isDark={isDark} faceIndex={faceIndex} />;
    case "ring":
      return <RingShape size={size} isDark={isDark} faceIndex={faceIndex} />;
    case "diamond":
      return <DiamondShape size={size} isDark={isDark} faceIndex={faceIndex} />;
    case "sphere":
      return <SphereShape size={size} isDark={isDark} faceIndex={faceIndex} />;
    default:
      return null;
  }
}

// ─── Individual Floating Shape ───────────────────────────────
function FloatingShape({
  config,
  maxSize,
  mouseIntensity,
  scrollIntensity,
  globalOpacity,
  isDark,
  mouseX,
  mouseY,
  scrollYProgress,
  prefersReducedMotion,
}: {
  config: ShapeConfig;
  maxSize: number;
  mouseIntensity: number;
  scrollIntensity: number;
  globalOpacity: number;
  isDark: boolean;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  prefersReducedMotion: boolean;
}) {
  // Scale size based on maxSize
  const scaleFactor = maxSize / 80;
  const size = Math.round(config.size * scaleFactor);

  // Spring-based mouse parallax
  const springConfig = { stiffness: 50, damping: 20, mass: 1 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  // Scroll parallax — each shape shifts based on depth
  const scrollShift = useTransform(
    scrollYProgress,
    [0, 1],
    [0, config.depth * scrollIntensity * -100]
  );

  // Mouse parallax — closer shapes (higher depth) move more
  const mouseParallaxX = useTransform(mouseXSpring, [-0.5, 0.5], [
    -config.depth * mouseIntensity * 60,
    config.depth * mouseIntensity * 60,
  ]);
  const mouseParallaxY = useTransform(mouseYSpring, [-0.5, 0.5], [
    -config.depth * mouseIntensity * 60,
    config.depth * mouseIntensity * 60,
  ]);

  if (prefersReducedMotion) {
    // Static positioning with no animation
    return (
      <div
        style={{
          position: "absolute",
          left: config.x,
          top: config.y,
          pointerEvents: "none",
          opacity: globalOpacity,
        }}
      >
        <ShapeContent type={config.type} size={size} isDark={isDark} faceIndex={0} />
      </div>
    );
  }

  return (
    <motion.div
      style={{
        position: "absolute",
        left: config.x,
        top: config.y,
        pointerEvents: "none",
        opacity: globalOpacity,
        x: mouseParallaxX,
        y: mouseParallaxY,
        marginTop: scrollShift,
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
    >
      {/* Float animation wrapper */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
        }}
        transition={{
          duration: config.floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: config.delay,
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Rotation wrapper */}
        <motion.div
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 360],
          }}
          transition={{
            rotateX: {
              duration: config.rotateDuration,
              repeat: Infinity,
              ease: "linear",
              delay: config.delay,
            },
            rotateY: {
              duration: config.rotateDuration * 0.7,
              repeat: Infinity,
              ease: "linear",
              delay: config.delay,
            },
          }}
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          <ShapeContent
            type={config.type}
            size={size}
            isDark={isDark}
            faceIndex={config.type.charCodeAt(0)}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────
function FloatingShapes3D({
  count = 6,
  maxSize = 80,
  mouseIntensity = 0.3,
  scrollIntensity = 0.2,
  opacity = 0.15,
  className,
}: FloatingShapes3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDark = useIsDark();

  // Mouse position as normalized values (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Scroll tracking
  const { scrollYProgress } = useScroll();

  // Track mouse position
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY, prefersReducedMotion]
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove, prefersReducedMotion]);

  // Select shapes from configs
  const shapes = SHAPE_CONFIGS.slice(0, Math.min(count, SHAPE_CONFIGS.length));

  // Adjusted opacity based on theme
  const adjustedOpacity = isDark ? opacity * 0.8 : opacity;

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      role="presentation"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {shapes.map((config, index) => (
        <FloatingShape
          key={`${config.type}-${index}`}
          config={config}
          maxSize={maxSize}
          mouseIntensity={mouseIntensity}
          scrollIntensity={scrollIntensity}
          globalOpacity={adjustedOpacity}
          isDark={isDark}
          mouseX={mouseX}
          mouseY={mouseY}
          scrollYProgress={scrollYProgress}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </div>
  );
}

export { FloatingShapes3D };
export default FloatingShapes3D;
