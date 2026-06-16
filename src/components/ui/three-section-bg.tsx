"use client";

import { useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import * as THREE from "three";
import { ThreeCanvasManager } from "@/lib/three/three-canvas";
import { createEnvironmentMap } from "@/lib/three/environment";
import { fbm, mulberry32 } from "@/lib/three/fbm";
import {
  makeStar,
  makeOctFrame,
  makeOctPrism,
  makeArmillary,
  makeArabesque,
  makeCrossPlanes,
  makeRoseRing,
} from "@/lib/three/geometry";
import { metalGoldMat } from "@/lib/three/materials";
import { ParticleShader, SkyShader } from "@/lib/three/shaders";

/* ─── Types ─── */
export type SectionTheme = "hero" | "events" | "stats" | "testimonials" | "cta" | "categories" | "footer";

interface ThreeSectionBgProps {
  theme?: SectionTheme;
  className?: string;
}

/* ─── Simpler materials for section backgrounds (better performance) ─── */
function createSectionMaterials() {
  const goldStd = new THREE.MeshStandardMaterial({
    color: 0xdaa520,
    metalness: 0.9,
    roughness: 0.15,
    emissive: 0x3a2500,
    emissiveIntensity: 0.15,
    side: THREE.DoubleSide,
  });

  const amberStd = new THREE.MeshStandardMaterial({
    color: 0xc47f17,
    metalness: 0.85,
    roughness: 0.2,
    emissive: 0x2a1a00,
    emissiveIntensity: 0.1,
    side: THREE.DoubleSide,
  });

  const goldTrans = new THREE.MeshStandardMaterial({
    color: 0xd4a843,
    metalness: 0.3,
    roughness: 0.1,
    transparent: true,
    opacity: 0.55,
    emissive: 0x5a4000,
    emissiveIntensity: 0.08,
    side: THREE.DoubleSide,
  });

  const tealTrans = new THREE.MeshStandardMaterial({
    color: 0x1a7a6d,
    metalness: 0.2,
    roughness: 0.15,
    transparent: true,
    opacity: 0.45,
    emissive: 0x0a3a30,
    emissiveIntensity: 0.08,
    side: THREE.DoubleSide,
  });

  const roseTrans = new THREE.MeshStandardMaterial({
    color: 0xc4836a,
    metalness: 0.25,
    roughness: 0.12,
    transparent: true,
    opacity: 0.5,
    emissive: 0x4a2a10,
    emissiveIntensity: 0.08,
    side: THREE.DoubleSide,
  });

  return {
    metals: [goldStd, amberStd],
    glass: [goldTrans, tealTrans, roseTrans],
  };
}

const SECTION_MATS = createSectionMaterials();

/* ─── Reduced motion detection (SSR-safe) ─── */
const reducedMotionQuery =
  typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

function subscribeReducedMotion(cb: () => void) {
  const mql = reducedMotionQuery;
  if (!mql) return () => {};
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}
function getReducedMotionSnapshot() {
  return reducedMotionQuery?.matches ?? false;
}
function getReducedMotionServerSnapshot() {
  return false;
}
function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
}

/* ─── Scene Configuration per Theme ─── */
interface ShapePlacement {
  type: "star8" | "star6" | "star10" | "octFrame" | "armillary" | "arabesque" | "cross" | "rose";
  x: number; y: number; z: number;
  scale: number;
  matType: "metal" | "glass";
  rotation: [number, number, number];
}

interface LightPlacement {
  type: "ambient" | "directional" | "point";
  color: number;
  intensity: number;
  position?: [number, number, number];
}

interface SceneConfig {
  particleCount: number;
  particleSeed: number;
  fogDensity: number;
  fogColor: number;
  cameraZ: number;
  shapes: ShapePlacement[];
  lights: LightPlacement[];
}

const PI = Math.PI;

const THEME_CONFIGS: Record<SectionTheme, SceneConfig> = {
  hero: {
    particleCount: 600, particleSeed: 42,
    fogDensity: 0.012, fogColor: 0x050210, cameraZ: 12,
    shapes: [
      { type: "star8", x: -3, y: 1.5, z: 5, scale: 1.8, matType: "glass", rotation: [0.3, 0.5, 0] },
      { type: "star8", x: 3, y: -1, z: 8, scale: 1.4, matType: "glass", rotation: [0.8, 0.2, 0.5] },
      { type: "octFrame", x: 0, y: 0, z: 10, scale: 2.2, matType: "metal", rotation: [0.1, 0.3, 0] },
      { type: "armillary", x: -2, y: -1.5, z: 6, scale: 1.0, matType: "metal", rotation: [0.5, 0.8, 0.3] },
      { type: "star6", x: 4, y: 2, z: 4, scale: 1.0, matType: "glass", rotation: [0.2, 0.7, 0.1] },
      { type: "rose", x: -4, y: -2, z: 7, scale: 0.9, matType: "metal", rotation: [0.6, 0.1, 0.4] },
      { type: "cross", x: 2, y: 2.5, z: 3, scale: 1.2, matType: "glass", rotation: [0.4, 0.6, 0.2] },
      { type: "star10", x: -1, y: 3, z: 9, scale: 0.8, matType: "glass", rotation: [0.7, 0.3, 0.5] },
    ],
    lights: [
      { type: "ambient", color: 0x1a0f05, intensity: 0.5 },
      { type: "directional", color: 0xffd090, intensity: 1.4, position: [5, 12, 10] },
      { type: "point", color: 0xffaa44, intensity: 25, position: [6, 3, 8] },
      { type: "point", color: 0x1affcc, intensity: 5, position: [2, 1, 6] },
    ],
  },
  events: {
    particleCount: 400, particleSeed: 43,
    fogDensity: 0.015, fogColor: 0x040108, cameraZ: 10,
    shapes: [
      { type: "star8", x: -2, y: 1, z: 6, scale: 1.5, matType: "glass", rotation: [0.2, 0.4, 0] },
      { type: "octFrame", x: 2, y: -0.5, z: 8, scale: 2.0, matType: "metal", rotation: [0.5, 0.1, 0.3] },
      { type: "arabesque", x: 0, y: 2, z: 4, scale: 0.8, matType: "metal", rotation: [0.3, 0.6, 0.1] },
      { type: "star6", x: -3, y: -1.5, z: 7, scale: 1.2, matType: "glass", rotation: [0.8, 0.2, 0.4] },
      { type: "cross", x: 3, y: 1.5, z: 5, scale: 1.0, matType: "glass", rotation: [0.1, 0.5, 0.2] },
      { type: "armillary", x: 0, y: -2, z: 9, scale: 0.7, matType: "metal", rotation: [0.4, 0.8, 0.6] },
    ],
    lights: [
      { type: "ambient", color: 0x1a0f05, intensity: 0.4 },
      { type: "directional", color: 0xffd090, intensity: 1.2, position: [4, 10, 8] },
      { type: "point", color: 0xffaa44, intensity: 20, position: [5, 2, 6] },
      { type: "point", color: 0xffd700, intensity: 15, position: [-4, 3, 10] },
    ],
  },
  stats: {
    particleCount: 300, particleSeed: 44,
    fogDensity: 0.014, fogColor: 0x030108, cameraZ: 10,
    shapes: [
      { type: "star8", x: 0, y: 0, z: 7, scale: 2.5, matType: "glass", rotation: [0.1, 0.2, 0] },
      { type: "star8", x: -3, y: 1.5, z: 5, scale: 1.2, matType: "metal", rotation: [0.4, 0.6, 0.2] },
      { type: "star8", x: 3, y: -1, z: 9, scale: 1.0, matType: "glass", rotation: [0.7, 0.3, 0.5] },
      { type: "octFrame", x: -1, y: -2, z: 6, scale: 1.8, matType: "metal", rotation: [0.2, 0.5, 0.1] },
      { type: "rose", x: 2, y: 2, z: 4, scale: 0.8, matType: "metal", rotation: [0.5, 0.1, 0.3] },
    ],
    lights: [
      { type: "ambient", color: 0x1a0f05, intensity: 0.4 },
      { type: "directional", color: 0xffd090, intensity: 1.0, position: [3, 8, 10] },
      { type: "point", color: 0xffd700, intensity: 18, position: [0, 3, 8] },
    ],
  },
  testimonials: {
    particleCount: 250, particleSeed: 45,
    fogDensity: 0.016, fogColor: 0x040108, cameraZ: 10,
    shapes: [
      { type: "star6", x: -2, y: 1, z: 6, scale: 1.3, matType: "glass", rotation: [0.3, 0.5, 0.1] },
      { type: "rose", x: 2, y: -0.5, z: 8, scale: 1.0, matType: "metal", rotation: [0.5, 0.2, 0.4] },
      { type: "star8", x: 0, y: 2, z: 4, scale: 1.5, matType: "glass", rotation: [0.1, 0.4, 0.2] },
      { type: "cross", x: -3, y: -1.5, z: 7, scale: 0.9, matType: "glass", rotation: [0.6, 0.1, 0.3] },
    ],
    lights: [
      { type: "ambient", color: 0x1a0f05, intensity: 0.35 },
      { type: "directional", color: 0xffd090, intensity: 1.0, position: [4, 8, 6] },
      { type: "point", color: 0xffcc66, intensity: 14, position: [-3, 2, 8] },
    ],
  },
  cta: {
    particleCount: 400, particleSeed: 46,
    fogDensity: 0.012, fogColor: 0x050210, cameraZ: 10,
    shapes: [
      { type: "star8", x: 0, y: 0, z: 6, scale: 2.2, matType: "glass", rotation: [0.2, 0.3, 0] },
      { type: "octFrame", x: -3, y: 1.5, z: 8, scale: 2.0, matType: "metal", rotation: [0.4, 0.6, 0.2] },
      { type: "armillary", x: 3, y: -1, z: 5, scale: 1.0, matType: "metal", rotation: [0.6, 0.2, 0.4] },
      { type: "star10", x: -1, y: -2, z: 4, scale: 0.9, matType: "glass", rotation: [0.3, 0.7, 0.1] },
      { type: "arabesque", x: 2, y: 2, z: 9, scale: 0.7, matType: "metal", rotation: [0.5, 0.3, 0.6] },
      { type: "cross", x: -2, y: 0.5, z: 7, scale: 1.1, matType: "glass", rotation: [0.1, 0.4, 0.3] },
    ],
    lights: [
      { type: "ambient", color: 0x1a0f05, intensity: 0.45 },
      { type: "directional", color: 0xffd090, intensity: 1.3, position: [5, 10, 8] },
      { type: "point", color: 0xffaa44, intensity: 22, position: [4, 2, 6] },
      { type: "point", color: 0xffd700, intensity: 18, position: [-5, -1, 10] },
    ],
  },
  categories: {
    particleCount: 350, particleSeed: 47,
    fogDensity: 0.014, fogColor: 0x040108, cameraZ: 10,
    shapes: [
      { type: "star6", x: -2, y: 1, z: 6, scale: 1.4, matType: "glass", rotation: [0.4, 0.6, 0.2] },
      { type: "star8", x: 2, y: -1, z: 8, scale: 1.8, matType: "metal", rotation: [0.2, 0.4, 0.1] },
      { type: "octFrame", x: 0, y: 0, z: 5, scale: 1.6, matType: "metal", rotation: [0.5, 0.1, 0.3] },
      { type: "arabesque", x: -3, y: -1.5, z: 7, scale: 0.8, matType: "metal", rotation: [0.3, 0.7, 0.5] },
      { type: "rose", x: 3, y: 1.5, z: 4, scale: 0.9, matType: "metal", rotation: [0.6, 0.2, 0.4] },
    ],
    lights: [
      { type: "ambient", color: 0x1a0f05, intensity: 0.4 },
      { type: "directional", color: 0xffd090, intensity: 1.1, position: [4, 9, 7] },
      { type: "point", color: 0xffaa44, intensity: 18, position: [3, 2, 8] },
    ],
  },
  footer: {
    particleCount: 150, particleSeed: 48,
    fogDensity: 0.018, fogColor: 0x030108, cameraZ: 10,
    shapes: [
      { type: "star8", x: -1, y: 0.5, z: 7, scale: 1.2, matType: "glass", rotation: [0.1, 0.3, 0] },
      { type: "octFrame", x: 2, y: -0.5, z: 9, scale: 1.5, matType: "metal", rotation: [0.3, 0.5, 0.2] },
      { type: "star6", x: -2, y: -1, z: 5, scale: 0.8, matType: "glass", rotation: [0.5, 0.2, 0.4] },
    ],
    lights: [
      { type: "ambient", color: 0x1a0f05, intensity: 0.3 },
      { type: "directional", color: 0xffd090, intensity: 0.8, position: [3, 6, 8] },
      { type: "point", color: 0xffaa44, intensity: 12, position: [0, 2, 6] },
    ],
  },
};

/* ─── Main Component ─── */
function ThreeSectionBg({ theme = "hero", className }: ThreeSectionBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const managerRef = useRef<ThreeCanvasManager | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  // Mouse handler
  useEffect(() => {
    if (prefersReducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReducedMotion]);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || managerRef.current) return;

    const config = THEME_CONFIGS[theme] ?? THEME_CONFIGS.hero;
    const rng = mulberry32(config.particleSeed);

    const manager = new ThreeCanvasManager(canvas, {
      fogColor: config.fogColor,
      fogDensity: config.fogDensity,
      toneMappingExposure: 1.0,
    });
    managerRef.current = manager;

    const { scene, camera } = manager;
    camera.position.set(0, 0, config.cameraZ);

    // Environment
    scene.environment = createEnvironmentMap(manager.renderer);

    // Sky (dark gradient)
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: SkyShader.vertexShader,
      fragmentShader: SkyShader.fragmentShader,
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(200, 16, 16), skyMat));

    // ── Add Shapes ──
    const animShapes: THREE.Object3D[] = [];

    config.shapes.forEach((shapeCfg) => {
      let obj: THREE.Object3D;
      const s = shapeCfg.scale;

      const getMaterial = (type: string) => {
        const arr = type === "metal" ? SECTION_MATS.metals : SECTION_MATS.glass;
        return arr[Math.floor(rng() * arr.length)];
      };
      const mat = getMaterial(shapeCfg.matType);

      switch (shapeCfg.type) {
        case "star8": obj = new THREE.Mesh(makeStar(8, s, s * 0.42, s * 0.1), mat); break;
        case "star6": obj = new THREE.Mesh(makeStar(6, s, s * 0.5, s * 0.08), mat); break;
        case "star10": obj = new THREE.Mesh(makeStar(10, s, s * 0.68, s * 0.07), mat); break;
        case "octFrame": obj = new THREE.Mesh(makeOctFrame(s, s * 0.35, s * 0.04, s * 0.06), mat); break;
        case "armillary": obj = makeArmillary(s * 0.7, 5, metalGoldMat); break;
        case "arabesque": obj = new THREE.Mesh(makeArabesque(s * 0.4, s * 0.08, 2, 3), mat); break;
        case "cross": obj = makeCrossPlanes(s, 3, mat); break;
        case "rose": obj = makeRoseRing(s * 0.6, s * 0.15, 8, metalGoldMat); break;
        default: obj = new THREE.Mesh(makeStar(8, s, s * 0.42, s * 0.1), mat); break;
      }

      obj.position.set(shapeCfg.x, shapeCfg.y, shapeCfg.z);
      obj.rotation.set(...shapeCfg.rotation);

      // Animation data
      const sp = shapeCfg.matType === "glass" ? 0.5 : 0.9;
      obj.userData = {
        rotSpd: new THREE.Vector3(
          (rng() - 0.5) * 0.006 * sp,
          (rng() - 0.5) * 0.006 * sp,
          (rng() - 0.5) * 0.004 * sp
        ),
        fSpd: 0.12 + rng() * 0.2,
        fAmp: 0.15 + rng() * 0.5,
        initY: shapeCfg.y,
        seeds: [rng() * 100, rng() * 100, rng() * 100],
      };

      scene.add(obj);
      animShapes.push(obj);
    });

    // ── Particles ──
    const PC = config.particleCount;
    const pGeo = new THREE.BufferGeometry();
    const pP = new Float32Array(PC * 3);
    const pSz = new Float32Array(PC);
    const pPh = new Float32Array(PC);
    const pBr = new Float32Array(PC);
    const pTp = new Float32Array(PC);

    for (let i = 0; i < PC; i++) {
      pP[i * 3] = (rng() - 0.5) * 30;
      pP[i * 3 + 1] = (rng() - 0.5) * 20;
      pP[i * 3 + 2] = (rng() - 0.5) * 30 + config.cameraZ;
      const isSpark = rng() < 0.08;
      const isTeal = rng() < 0.12;
      pSz[i] = isSpark ? 1.5 + rng() * 2.5 : 0.2 + rng() * 0.6;
      pPh[i] = rng() * Math.PI * 2;
      pBr[i] = isSpark ? 0.7 + rng() * 0.3 : 0.1 + rng() * 0.35;
      pTp[i] = isTeal ? 1 : 0;
    }

    pGeo.setAttribute("position", new THREE.BufferAttribute(pP, 3));
    pGeo.setAttribute("aSize", new THREE.BufferAttribute(pSz, 1));
    pGeo.setAttribute("aPhase", new THREE.BufferAttribute(pPh, 1));
    pGeo.setAttribute("aBright", new THREE.BufferAttribute(pBr, 1));
    pGeo.setAttribute("aType", new THREE.BufferAttribute(pTp, 1));

    const pMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uGold: { value: new THREE.Color(0xffd700) },
        uTeal: { value: new THREE.Color(0x1affcc) },
        uWarm: { value: new THREE.Color(0xfff0c0) },
      },
      vertexShader: ParticleShader.vertexShader,
      fragmentShader: ParticleShader.fragmentShader,
    });
    scene.add(new THREE.Points(pGeo, pMat));

    // ── Lights ──
    config.lights.forEach((lCfg) => {
      if (lCfg.type === "ambient") {
        scene.add(new THREE.AmbientLight(lCfg.color, lCfg.intensity));
      } else if (lCfg.type === "directional" && lCfg.position) {
        const dl = new THREE.DirectionalLight(lCfg.color, lCfg.intensity);
        dl.position.set(...lCfg.position);
        scene.add(dl);
      } else if (lCfg.type === "point" && lCfg.position) {
        const pl = new THREE.PointLight(lCfg.color, lCfg.intensity, 40);
        pl.position.set(...lCfg.position);
        scene.add(pl);
      }
    });

    // ── Reduced Motion Scale ──
    const MS = prefersReducedMotion ? 0.12 : 1.0;

    // ── Animation Loop ──
    manager.start((_dt, elapsed) => {
      const t = elapsed * MS;

      // Camera subtle sway
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      camera.position.x += (fbm(t * 0.03, 0) * 2 + (mx - 0.5) * 1.5 - camera.position.x) * 0.01;
      camera.position.y += (fbm(t * 0.025, 3) * 1.5 - (my - 0.5) * 0.8 - camera.position.y) * 0.01;
      camera.lookAt(0, 0, config.cameraZ + 10);

      // Animate shapes
      animShapes.forEach((obj) => {
        const u = obj.userData;
        if (!u?.rotSpd) return;
        obj.rotation.x += u.rotSpd.x * MS;
        obj.rotation.y += u.rotSpd.y * MS;
        obj.rotation.z += u.rotSpd.z * MS;
        obj.position.y = u.initY + fbm(t * u.fSpd, u.seeds[0]) * u.fAmp;

        // Gentle breathing scale
        const s = 1 + fbm(t * 0.15, u.seeds[1]) * 0.03;
        obj.scale.set(s, s, s);
      });

      // Particle time uniform
      pMat.uniforms.uTime.value = t;
    });
  }, [theme, prefersReducedMotion]);

  const cleanup = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.dispose();
      managerRef.current = null;
    }
  }, []);

  useEffect(() => {
    init();
    return cleanup;
  }, [init, cleanup]);

  if (prefersReducedMotion) {
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
          background: "linear-gradient(to bottom, oklch(0.15 0.03 260) 0%, oklch(0.12 0.04 260) 100%)",
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      role="presentation"
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}

export { ThreeSectionBg };
export type { SectionTheme as ThreeSectionTheme };
