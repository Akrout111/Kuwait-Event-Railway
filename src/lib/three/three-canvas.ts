/**
 * Core Three.js Canvas Manager
 * Handles renderer, resize, animation loop, IntersectionObserver
 * Shared by all Three.js background components
 */

import * as THREE from "three";

export interface ThreeCanvasConfig {
  antialias?: boolean;
  dpr?: number;
  fogColor?: number;
  fogDensity?: number;
  toneMappingExposure?: number;
}

export class ThreeCanvasManager {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  clock: THREE.Clock;
  animationId: number | null = null;
  isInView = false;
  isRunning = false;
  private config: Required<ThreeCanvasConfig>;
  private observer: IntersectionObserver | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    config: ThreeCanvasConfig = {}
  ) {
    this.config = {
      antialias: config.antialias ?? true,
      dpr: config.dpr ?? Math.min(window.devicePixelRatio, 2),
      fogColor: config.fogColor ?? 0x030209,
      fogDensity: config.fogDensity ?? 0.009,
      toneMappingExposure: config.toneMappingExposure ?? 1.15,
    };

    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: this.config.antialias,
      powerPreference: "high-performance",
      alpha: true,
    });
    this.renderer.setSize(W, H);
    this.renderer.setPixelRatio(this.config.dpr);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.config.toneMappingExposure;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(this.config.fogColor, this.config.fogDensity);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 500);
    this.camera.position.set(0, 0, 0);

    // Clock
    this.clock = new THREE.Clock();

    // Resize
    this.handleResize();
    window.addEventListener("resize", this.onResize);

    // IntersectionObserver
    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.isInView = entry.isIntersecting;
      },
      { rootMargin: "200px", threshold: 0 }
    );
    this.observer.observe(canvas);
    this.isInView = true; // assume visible initially
  }

  private onResize = () => {
    this.handleResize();
  };

  handleResize() {
    const rect = this.canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H);
  }

  start(updateFn: (dt: number, elapsed: number) => void) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      if (!this.isInView) return;
      const dt = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();
      updateFn(dt, elapsed);
      this.renderer.render(this.scene, this.camera);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  stop() {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  dispose() {
    this.stop();
    window.removeEventListener("resize", this.onResize);
    this.observer?.disconnect();
    this.renderer.dispose();
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });
  }
}
