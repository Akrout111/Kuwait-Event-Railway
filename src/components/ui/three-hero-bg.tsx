"use client";

import { useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
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
  createLattice3D,
  mkCookie,
} from "@/lib/three/geometry";
import { glassArr, solidArr, metalGoldMat, wireGold, tealGlass } from "@/lib/three/materials";
import { SkyShader, OrbShader, BeamShader, CausticShader, ParticleShader, CinematicShader } from "@/lib/three/shaders";

/* ─── Constants ─── */
const EPS = 0.001;
const BAND = 150;
const CAM_SPD = 0.014;
const PI = Math.PI;

/* ─── Reduced motion detection ─── */
const emptySubscribe = () => () => {};

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

interface ThreeHeroBgProps {
  scrollProgress: number;
  mouseX: number;
  mouseY: number;
}

export function ThreeHeroBg({ scrollProgress, mouseX, mouseY }: ThreeHeroBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const managerRef = useRef<ThreeCanvasManager | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Refs for reactive props
  const scrollRef = useRef(scrollProgress);
  const mouseRef = useRef({ x: mouseX, y: mouseY });
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => { scrollRef.current = scrollProgress; }, [scrollProgress]);
  useEffect(() => { targetMouseRef.current = { x: mouseX, y: mouseY }; }, [mouseX, mouseY]);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || managerRef.current) return;

    const manager = new ThreeCanvasManager(canvas, {
      fogColor: 0x030209,
      fogDensity: 0.009,
      toneMappingExposure: 1.15,
    });
    managerRef.current = manager;

    const { scene, camera } = manager;

    // ── Environment Map ──
    scene.environment = createEnvironmentMap(manager.renderer);

    // ── Sky Background ──
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: SkyShader.vertexShader,
      fragmentShader: SkyShader.fragmentShader,
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(380, 32, 32), skyMat));

    // ── Line material for lattice (reusable) ──
    const latticeLineMat = new THREE.LineBasicMaterial({ color: 0xdaa520, transparent: true, opacity: 0.55 });

    // ── Lattice Screens ──
    const lattices: THREE.Group[] = [];
    const latticeConfigs = [
      { x: -4.5, y: 0.5, z: 22, size: 6, gridN: 3, layers: 4, rotY: 0.18 },
      { x: 4, y: -0.5, z: 55, size: 7, gridN: 4, layers: 4, rotY: -0.15 },
      { x: -3, y: 1, z: 88, size: 5, gridN: 3, layers: 3, rotY: 0.25 },
      { x: 3.5, y: -0.3, z: 120, size: 6.5, gridN: 3, layers: 4, rotY: -0.12 },
    ];
    latticeConfigs.forEach((cfg) => {
      const l = createLattice3D(cfg.x, cfg.y, cfg.z, cfg.size, cfg.gridN, cfg.layers, cfg.rotY, latticeLineMat);
      lattices.push(l);
      scene.add(l);
    });

    // ── Scene Shapes ──
    const allShapes: THREE.Object3D[] = [];
    const clusterZ = [5, 30, 58, 85, 112, 140];
    const rng = mulberry32(42);

    function addAnim(obj: THREE.Object3D, type: string) {
      const sp = type === "glass" ? 0.5 : type === "wire" ? 1.2 : 0.9;
      obj.userData = {
        rotSpd: new THREE.Vector3(
          (rng() - 0.5) * 0.004 * sp,
          (rng() - 0.5) * 0.004 * sp,
          (rng() - 0.5) * 0.003 * sp
        ),
        fSpd: 0.08 + rng() * 0.25,
        fAmp: 0.1 + rng() * 0.4,
        bSpd: [0.08 + rng() * 0.15, 0.09 + rng() * 0.17, 0.06 + rng() * 0.14],
        bAmp: 0.008 + rng() * 0.025,
        initY: obj.position.y,
        seeds: [rng() * 100, rng() * 100, rng() * 100],
        type,
      };
    }

    const starPts = [8, 6, 10, 12, 8, 10];
    const innerRatios = [0.42, 0.5, 0.68, 0.78, 0.42, 0.68];

    clusterZ.forEach((cz, ci) => {
      const cx = (rng() - 0.5) * 4;
      const cy = (rng() - 0.5) * 2;

      // Central large glass star
      const cR = 1.2 + rng() * 0.4;
      const cG = makeStar(starPts[ci], cR, cR * innerRatios[ci], cR * 0.12);
      const cM = new THREE.Mesh(cG, glassArr[ci % 5]);
      cM.position.set(cx, cy, cz);
      cM.rotation.set(rng() * PI, rng() * PI, rng() * PI);
      addAnim(cM, "glass");
      scene.add(cM);
      allShapes.push(cM);

      // Surrounding shapes
      const count = 4 + Math.floor(rng() * 3);
      for (let j = 0; j < count; j++) {
        const s = 0.3 + rng() * 0.8;
        const tp = Math.floor(rng() * 9);
        let geo: THREE.BufferGeometry;

        switch (tp) {
          case 0: geo = makeStar(8, s, s * 0.42, s * 0.1); break;
          case 1: geo = makeStar(6, s, s * 0.5, s * 0.08); break;
          case 2: geo = makeStar(10, s, s * 0.68, s * 0.07); break;
          case 3: geo = makeStar(12, s, s * 0.78, s * 0.06); break;
          case 4: geo = makeOctPrism(s * 0.5, s * 0.3); break;
          case 5: geo = makeArabesque(s * 0.4, s * 0.08, 2 + Math.floor(rng() * 2), 3 + Math.floor(rng() * 3)); break;
          case 6: geo = makeOctFrame(s * 1.2, s * 0.4, s * 0.04, s * 0.06); break;
          case 7: {
            const grp = makeCrossPlanes(s, 3, glassArr[Math.floor(rng() * 5)]);
            grp.position.set(cx + (rng() - 0.5) * 14, cy + (rng() - 0.5) * 8, cz + (rng() - 0.5) * 16);
            grp.rotation.set(rng() * PI, rng() * PI, rng() * PI);
            addAnim(grp, "glass");
            scene.add(grp);
            allShapes.push(grp);
            continue;
          }
          default: geo = makeStar(8, s, s * 0.42, s * 0.06); break;
        }

        const r = rng();
        const mat = r < 0.5 ? glassArr[Math.floor(rng() * 5)] : r < 0.82 ? solidArr[Math.floor(rng() * 2)] : wireGold;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(cx + (rng() - 0.5) * 14, cy + (rng() - 0.5) * 8, cz + (rng() - 0.5) * 16);
        mesh.rotation.set(rng() * PI * 2, rng() * PI * 2, rng() * PI * 2);
        addAnim(mesh, r < 0.5 ? "glass" : r < 0.82 ? "solid" : "wire");
        scene.add(mesh);
        allShapes.push(mesh);
      }

      // Octagonal frame accent
      const fs = 1.3 + rng() * 1.0;
      const fM = new THREE.Mesh(makeOctFrame(fs, fs * 0.35, 0.04, 0.06), metalGoldMat);
      fM.position.set(cx + (rng() - 0.5) * 5, cy + (rng() - 0.5) * 3, cz + (rng() - 0.5) * 6);
      fM.rotation.set(rng() * PI, rng() * PI, 0);
      addAnim(fM, "solid");
      scene.add(fM);
      allShapes.push(fM);

      // Armillary (alternating)
      if (ci % 2 === 0) {
        const arm = makeArmillary(0.7 + rng() * 0.5, 5, metalGoldMat);
        arm.position.set(cx + (rng() - 0.5) * 8, cy + (rng() - 0.5) * 4, cz + (rng() - 0.5) * 8);
        arm.rotation.set(rng() * PI, rng() * PI, rng() * PI);
        addAnim(arm, "solid");
        scene.add(arm);
        allShapes.push(arm);
      }

      // Rose ring (alternating)
      if (ci % 2 === 1) {
        const rr = makeRoseRing(0.6 + rng() * 0.4, 0.15, 8, metalGoldMat);
        rr.position.set(cx + (rng() - 0.5) * 7, cy + (rng() - 0.5) * 3, cz + (rng() - 0.5) * 7);
        rr.rotation.set(rng() * PI, rng() * PI, rng() * PI);
        addAnim(rr, "solid");
        scene.add(rr);
        allShapes.push(rr);
      }

      // Close foreground accent
      if (ci % 3 === 0) {
        const fgs = 0.5 + rng() * 0.6;
        const fgG = makeStar(8, fgs, fgs * 0.42, fgs * 0.06);
        const fgM = new THREE.Mesh(fgG, tealGlass);
        fgM.position.set(cx + (rng() - 0.5) * 3, cy + (rng() - 0.5) * 2, cz - 7 - rng() * 4);
        fgM.rotation.set(rng() * PI, rng() * PI, rng() * PI);
        addAnim(fgM, "glass");
        scene.add(fgM);
        allShapes.push(fgM);
      }
    });

    // ── Floating Light Orbs ──
    const orbUni = { uTime: { value: 0 } };
    const orbs: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const isTeal = i < 3;
      const geo = new THREE.SphereGeometry(Math.max(EPS, 0.05 + rng() * 0.03), 10, 10);
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniforms: { uTime: orbUni.uTime, uColor: { value: new THREE.Color(isTeal ? 0x1affcc : 0xffd080) } },
        vertexShader: OrbShader.vertexShader,
        fragmentShader: OrbShader.fragmentShader,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const bx = (rng() - 0.5) * 10;
      const by = (rng() - 0.5) * 5;
      const bz = 5 + rng() * 100;
      mesh.position.set(bx, by, bz);
      mesh.userData = {
        baseX: bx, baseY: by, baseZ: bz,
        spdX: 0.06 + rng() * 0.12, spdY: 0.05 + rng() * 0.1, spdZ: 0.03 + rng() * 0.06,
        ampX: 2 + rng() * 3, ampY: 1.5 + rng() * 2.5, ampZ: 0.8 + rng() * 1.5,
        seed: rng() * 100,
      };
      scene.add(mesh);
      orbs.push(mesh);

      // Point light on orb
      const pl = new THREE.PointLight(isTeal ? 0x1affcc : 0xffbb55, isTeal ? 6 : 10, isTeal ? 18 : 25);
      mesh.add(pl);

      // Glow sphere
      const gMat = new THREE.MeshBasicMaterial({
        color: isTeal ? 0x1affcc : 0xffaa44,
        transparent: true,
        opacity: 0.02,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      });
      mesh.add(new THREE.Mesh(new THREE.SphereGeometry(Math.max(EPS, 1.2 + rng() * 0.8), 10, 10), gMat));
    }

    // ── Atmospheric Glow Volumes ──
    [8, 35, 68, 98].forEach((z, i) => {
      const isTeal = i % 3 === 0;
      const gMat = new THREE.MeshBasicMaterial({
        color: isTeal ? 0x1affcc : 0xffaa44,
        transparent: true,
        opacity: 0.012,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.BackSide,
      });
      const s = new THREE.Mesh(new THREE.SphereGeometry(Math.max(EPS, 7 + rng() * 5), 14, 14), gMat);
      s.position.set((rng() - 0.5) * 8, (rng() - 0.5) * 4, z);
      scene.add(s);
      allShapes.push(s);
      addAnim(s, "glass");
    });

    // ── Volumetric Light Beams ──
    const beamUni = { uTime: { value: 0 } };
    const beams: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const geo = new THREE.PlaneGeometry(Math.max(EPS, 2 + rng() * 4), Math.max(EPS, 25 + rng() * 35), 1, 20);
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uTime: beamUni.uTime, uColor: { value: new THREE.Color(0xffd080) }, uOp: { value: 0.03 + rng() * 0.035 } },
        vertexShader: BeamShader.vertexShader,
        fragmentShader: BeamShader.fragmentShader,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set((rng() - 0.5) * 20, 7 + rng() * 10, 3 + rng() * 85);
      m.rotation.set(-0.2 - rng() * 0.5, 0, (rng() - 0.5) * 0.3);
      scene.add(m);
      beams.push(m);
    }

    // ── Caustic Light Patterns ──
    const causUni = { uTime: { value: 0 } };
    const caustics: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const sz = Math.max(EPS, 4 + rng() * 4);
      const geo = new THREE.PlaneGeometry(sz, sz);
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uTime: causUni.uTime, uColor: { value: new THREE.Color(0xffcc66) } },
        vertexShader: CausticShader.vertexShader,
        fragmentShader: CausticShader.fragmentShader,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set((rng() - 0.5) * 12, -2.5 + rng() * 3, 3 + rng() * 60);
      m.rotation.set(-PI / 2 + (rng() - 0.5) * 0.3, 0, rng() * PI);
      scene.add(m);
      caustics.push(m);
    }

    // ── Dust Particles ──
    const PC = 2500;
    const pGeo = new THREE.BufferGeometry();
    const pP = new Float32Array(PC * 3);
    const pSz = new Float32Array(PC);
    const pPh = new Float32Array(PC);
    const pBr = new Float32Array(PC);
    const pTp = new Float32Array(PC);

    for (let i = 0; i < PC; i++) {
      pP[i * 3] = (rng() - 0.5) * 55;
      pP[i * 3 + 1] = (rng() - 0.5) * 30;
      pP[i * 3 + 2] = rng() * BAND - 18;
      const isSpark = rng() < 0.06;
      const isTeal = rng() < 0.1;
      pSz[i] = isSpark ? 1.8 + rng() * 3 : 0.2 + rng() * 0.8;
      pPh[i] = rng() * PI * 2;
      pBr[i] = isSpark ? 0.8 + rng() * 0.2 : 0.1 + rng() * 0.4;
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

    // ── Spot Light Cookies ──
    const ck1 = mkCookie(512);
    const ck2 = mkCookie(256);
    const spotCfg = [
      { pos: [3, 14, 35] as const, tgt: [0, 0, 28] as const, col: 0xffd080, int: 80, ang: 0.45, pen: 0.6, dist: 55, tex: ck1 },
      { pos: [-4, 12, 70] as const, tgt: [-1, 0, 62] as const, col: 0xffaa44, int: 60, ang: 0.4, pen: 0.5, dist: 50, tex: ck2 },
      { pos: [1, 15, 100] as const, tgt: [0, 0, 92] as const, col: 0x1affcc, int: 18, ang: 0.5, pen: 0.7, dist: 45, tex: ck1 },
    ];
    const spotLights: THREE.SpotLight[] = [];
    spotCfg.forEach((c) => {
      const sl = new THREE.SpotLight(c.col, c.int, c.dist, c.ang, c.pen, 1.5);
      sl.map = c.tex;
      sl.position.set(c.pos[0], c.pos[1], c.pos[2]);
      sl.target.position.set(c.tgt[0], c.tgt[1], c.tgt[2]);
      scene.add(sl);
      scene.add(sl.target);
      spotLights.push(sl);
    });

    // ── Standard Lighting ──
    scene.add(new THREE.AmbientLight(0x1a0f05, 0.5));
    const keyL = new THREE.DirectionalLight(0xffd090, 1.4);
    keyL.position.set(5, 12, 10);
    scene.add(keyL);

    const warmCfg = [
      { col: 0xffaa44, int: 25, dist: 40, pos: [6, 3, 15] as const },
      { col: 0xff8800, int: 18, dist: 36, pos: [-7, 2, 30] as const },
      { col: 0xffd700, int: 22, dist: 35, pos: [0, -3, 50] as const },
      { col: 0xffcc66, int: 14, dist: 42, pos: [4, 5, 70] as const },
      { col: 0xff9933, int: 16, dist: 38, pos: [-5, -2, 90] as const },
      { col: 0x1affcc, int: 5, dist: 28, pos: [2, 1, 42] as const },
    ];
    const warmLts: THREE.PointLight[] = [];
    warmCfg.forEach((c) => {
      const pl = new THREE.PointLight(c.col, c.int, c.dist);
      pl.position.set(c.pos[0], c.pos[1], c.pos[2]);
      scene.add(pl);
      warmLts.push(pl);
    });

    // ── Post-Processing ──
    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    const composer = new EffectComposer(manager.renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.35, 0.3, 0.6));

    const cinePass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(W, H) },
      },
      vertexShader: CinematicShader.vertexShader,
      fragmentShader: CinematicShader.fragmentShader,
    });
    composer.addPass(cinePass);
    composer.addPass(new OutputPass());

    // ── Reduced Motion Scale ──
    const MS = prefersReducedMotion ? 0.12 : 1.0;

    // ── Animation Loop ──
    manager.start((_dt, t) => {
      // Mouse smoothing
      const mx = targetMouseRef.current.x;
      const my = targetMouseRef.current.y;
      currentMouseRef.current.x += (mx - currentMouseRef.current.x) * 0.025;
      currentMouseRef.current.y += (my - currentMouseRef.current.y) * 0.025;

      // Camera drift — noise-based organic sway
      camera.position.z += CAM_SPD * MS;
      const cx = fbm(t * 0.04 * MS, 0) * 3.5 + currentMouseRef.current.x * 1.8;
      const cy = fbm(t * 0.03 * MS, 3) * 2.2 - currentMouseRef.current.y * 1.2;
      camera.position.x += (cx - camera.position.x) * 0.012;
      camera.position.y += (cy - camera.position.y) * 0.012;
      camera.lookAt(
        camera.position.x * 0.12 + currentMouseRef.current.x * 0.6,
        camera.position.y * 0.12 - currentMouseRef.current.y * 0.3,
        camera.position.z + 35
      );

      // Shapes animation + recycle
      allShapes.forEach((m) => {
        if (m.position.z < camera.position.z - 28) {
          m.position.z += BAND;
          m.position.x = (rng() - 0.5) * 26;
          m.position.y = (rng() - 0.5) * 14;
          if (m.userData) m.userData.initY = m.position.y;
        }
        const u = m.userData;
        if (!u?.rotSpd) return;
        m.rotation.x += u.rotSpd.x * MS;
        m.rotation.y += u.rotSpd.y * MS;
        m.rotation.z += u.rotSpd.z * MS;
        m.position.y = u.initY + fbm(t * u.fSpd * MS, u.seeds[0]) * u.fAmp * 2;
        const sx = 1 + fbm(t * u.bSpd[0] * MS, u.seeds[0]) * u.bAmp * 2;
        const sy = 1 + fbm(t * u.bSpd[1] * MS, u.seeds[1]) * u.bAmp * 2;
        const sz = 1 + fbm(t * u.bSpd[2] * MS, u.seeds[2]) * u.bAmp * 2;
        m.scale.set(sx, sy, sz);
      });

      // Lattices — recycle and gently rotate
      lattices.forEach((l) => {
        if (l.position.z < camera.position.z - 25) l.position.z += BAND;
        l.rotation.y += 0.0003 * MS;
        l.rotation.x = Math.sin(t * 0.05) * 0.02;
      });

      // Light orbs
      orbs.forEach((o) => {
        const u = o.userData;
        o.position.x = u.baseX + fbm(t * u.spdX, u.seed) * u.ampX;
        o.position.y = u.baseY + fbm(t * u.spdY, u.seed + 50) * u.ampY;
        o.position.z = u.baseZ + fbm(t * u.spdZ, u.seed + 100) * u.ampZ;
        if (o.position.z < camera.position.z - 20) {
          o.position.z += BAND;
          u.baseZ += BAND;
        }
      });

      // Particles — recycle
      const pa = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < PC; i++) {
        if (pa[i * 3 + 2] < camera.position.z - 22) {
          pa[i * 3 + 2] += BAND;
          pa[i * 3] = (rng() - 0.5) * 55;
          pa[i * 3 + 1] = (rng() - 0.5) * 30;
        }
      }
      pGeo.attributes.position.needsUpdate = true;

      // Uniforms
      pMat.uniforms.uTime.value = t;
      beamUni.uTime.value = t;
      causUni.uTime.value = t;
      orbUni.uTime.value = t;
      cinePass.uniforms.uTime.value = t;

      // Recycle volumetric elements
      beams.forEach((b) => {
        if (b.position.z < camera.position.z - 28) b.position.z += BAND;
      });
      caustics.forEach((c) => {
        if (c.position.z < camera.position.z - 22) c.position.z += BAND;
      });

      // Move lights with camera
      warmLts.forEach((pl, i) => {
        pl.position.z = warmCfg[i].pos[2] + camera.position.z;
        pl.position.x = warmCfg[i].pos[0] + Math.sin(t * 0.18 + i * 1.5) * 2;
        pl.position.y = warmCfg[i].pos[1] + Math.cos(t * 0.14 + i * 2.0) * 1.5;
      });
      spotLights.forEach((sl, i) => {
        sl.position.z = spotCfg[i].pos[2] + camera.position.z;
        sl.target.position.z = spotCfg[i].tgt[2] + camera.position.z;
      });
      keyL.position.z = 10 + camera.position.z;

      // Render with post-processing
      composer.render();
    });
  }, [prefersReducedMotion]);

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

  // Static fallback for reduced motion
  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, oklch(0.15 0.03 260) 0%, oklch(0.12 0.04 260) 50%, oklch(0.10 0.02 260) 100%)",
        }}
      />
    );
  }

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
