/**
 * Islamic Geometric Geometry Generators for Three.js
 * Ported from the Golden Geometric Visions reference
 * All radii/dimensions clamped with EPS for safety
 */

import * as THREE from "three";

const EPS = 0.001;
const PI = Math.PI;

/* ─── N-pointed star polygon with correct Islamic proportions ─── */
export function makeStar(pts: number, outerR: number, innerR: number, depth: number): THREE.ExtrudeGeometry {
  outerR = Math.max(EPS, outerR);
  innerR = Math.max(EPS, innerR);
  depth = Math.max(EPS, depth);

  const n = pts * 2;
  const shape = new THREE.Shape();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * PI * 2 - PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();

  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.035,
    bevelSegments: 2,
  });
  g.computeVertexNormals();
  g.translate(0, 0, -depth / 2);
  return g;
}

/* ─── Octagonal frame ring ─── */
export function makeOctFrame(oR: number, iR: number, d: number, th: number): THREE.ExtrudeGeometry {
  oR = Math.max(EPS, oR);
  iR = Math.max(EPS, iR);
  d = Math.max(EPS, d);
  th = Math.max(EPS, th);

  const mR = (oR + iR) / 2;
  const shape = new THREE.Shape();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * PI * 2 - PI / 2;
    const r = i % 2 === 0 ? mR + th : mR - th;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();

  const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
  g.computeVertexNormals();
  g.translate(0, 0, -d / 2);
  return g;
}

/* ─── Octagonal prism — 8-sided column ─── */
export function makeOctPrism(radius: number, height: number): THREE.CylinderGeometry {
  radius = Math.max(EPS, radius);
  height = Math.max(EPS, height);
  return new THREE.CylinderGeometry(radius, radius, height, 8);
}

/* ─── Armillary sphere — concentric tilted rings ─── */
export function makeArmillary(rad: number, n: number, metalMat: THREE.Material): THREE.Group {
  const grp = new THREE.Group();
  const rng = () => Math.random(); // intentional random for visual variety
  for (let i = 0; i < n; i++) {
    const r = Math.max(EPS, rad * (0.4 + i * 0.22));
    const tube = Math.max(EPS, 0.022 + rng() * 0.018);
    const geo = new THREE.TorusGeometry(r, tube, 10, 80);
    const ring = new THREE.Mesh(geo, metalMat);
    ring.rotation.x = (i / n) * PI + rng() * 0.5;
    ring.rotation.y = (i / n) * PI * 0.7 + rng() * 0.6;
    grp.add(ring);
  }
  return grp;
}

/* ─── Arabesque torus knot ─── */
export function makeArabesque(rad: number, tube: number, p: number, q: number): THREE.TorusKnotGeometry {
  return new THREE.TorusKnotGeometry(Math.max(EPS, rad), Math.max(EPS, tube), 140, 18, p, q);
}

/* ─── Intersecting planes — thin glass planes at regular angular intervals ─── */
export function makeCrossPlanes(radius: number, count: number, mat: THREE.Material): THREE.Group {
  const grp = new THREE.Group();
  const h = Math.max(EPS, radius * 2);
  const w = Math.max(EPS, radius * 2);
  for (let i = 0; i < count; i++) {
    const geo = new THREE.PlaneGeometry(w, h);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.y = (i / count) * PI;
    grp.add(mesh);
  }
  return grp;
}

/* ─── Geometric rose ring ─── */
export function makeRoseRing(majorR: number, minorR: number, petals: number, metalMat: THREE.Material): THREE.Group {
  const grp = new THREE.Group();
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * PI * 2;
    const petalR = Math.max(EPS, minorR * 0.5);
    const geo = new THREE.SphereGeometry(petalR, 8, 8);
    const mesh = new THREE.Mesh(geo, metalMat);
    mesh.position.set(Math.cos(angle) * majorR, 0, Math.sin(angle) * majorR);
    mesh.scale.set(1, 0.4, 0.6);
    grp.add(mesh);
  }
  // Central ring
  const ringGeo = new THREE.TorusGeometry(Math.max(EPS, majorR), Math.max(EPS, minorR * 0.12), 10, 64);
  grp.add(new THREE.Mesh(ringGeo, metalMat));
  return grp;
}

/* ─── 3D Volumetric Lattice Screen ─── */
export function createLattice3D(
  x: number, y: number, z: number,
  size: number, gridN: number, layers: number,
  rotY: number, lineMat: THREE.LineBasicMaterial
): THREE.Group {
  const grp = new THREE.Group();
  const cellW = size / gridN;
  const layerGap = 0.2;

  for (let l = 0; l < layers; l++) {
    const pts: number[] = [];
    const zOff = (l - (layers - 1) / 2) * layerGap;

    for (let gi = 0; gi < gridN; gi++) {
      for (let gj = 0; gj < gridN; gj++) {
        const cx = (gi - gridN / 2 + 0.5) * cellW;
        const cy = (gj - gridN / 2 + 0.5) * cellW;
        const oR = cellW * 0.38;
        const iR = cellW * 0.16;

        /* 8-pointed star outline */
        for (let k = 0; k < 16; k++) {
          const a1 = (k / 16) * PI * 2 - PI / 2;
          const a2 = ((k + 1) / 16) * PI * 2 - PI / 2;
          const r1 = k % 2 === 0 ? oR : iR;
          const r2 = (k + 1) % 2 === 0 ? oR : iR;
          pts.push(cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1, zOff);
          pts.push(cx + Math.cos(a2) * r2, cy + Math.sin(a2) * r2, zOff);
        }

        /* Connecting ribs */
        if (gi < gridN - 1) {
          pts.push(cx + oR, cy, zOff, cx + cellW - oR, cy, zOff);
        }
        if (gj < gridN - 1) {
          pts.push(cx, cy + oR, zOff, cx, cy + cellW - oR, zOff);
        }
        /* Diagonal ribs */
        const dR = oR * 0.72;
        if (gi < gridN - 1 && gj < gridN - 1) {
          pts.push(cx + dR * 0.707, cy + dR * 0.707, zOff, cx + cellW - dR * 0.707, cy + cellW - dR * 0.707, zOff);
        }
        if (gi < gridN - 1 && gj > 0) {
          pts.push(cx + dR * 0.707, cy - dR * 0.707, zOff, cx + cellW - dR * 0.707, cy - cellW + dR * 0.707, zOff);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const opacity = 0.55 - l * 0.07;
    const mat = new THREE.LineBasicMaterial({ color: 0xdaa520, transparent: true, opacity });
    grp.add(new THREE.LineSegments(geo, mat));
  }

  /* Inter-layer vertical connections */
  const cPts: number[] = [];
  for (let gi = 0; gi < gridN; gi++) {
    for (let gj = 0; gj < gridN; gj++) {
      const cx = (gi - gridN / 2 + 0.5) * cellW;
      const cy = (gj - gridN / 2 + 0.5) * cellW;
      cPts.push(cx, cy, -((layers - 1) / 2) * layerGap);
      cPts.push(cx, cy, ((layers - 1) / 2) * layerGap);
    }
  }
  const cGeo = new THREE.BufferGeometry();
  cGeo.setAttribute("position", new THREE.Float32BufferAttribute(cPts, 3));
  grp.add(new THREE.LineSegments(cGeo, new THREE.LineBasicMaterial({ color: 0xdaa520, transparent: true, opacity: 0.18 })));

  grp.position.set(x, y, z);
  grp.rotation.y = rotY || 0;
  return grp;
}

/* ─── Spot Light Cookie Texture (Islamic star pattern) ─── */
export function mkCookie(sz: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = sz;
  const x = c.getContext("2d")!;
  x.fillStyle = "#000";
  x.fillRect(0, 0, sz, sz);
  x.fillStyle = "#fff";

  const g = 5;
  const cl = sz / g;
  const oR = cl * 0.36;
  const iR = cl * 0.15;

  for (let gi = 0; gi < g; gi++) {
    for (let gj = 0; gj < g; gj++) {
      const cx = cl * 0.5 + gi * cl;
      const cy = cl * 0.5 + gj * cl;
      x.beginPath();
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * PI * 2;
        const r = k % 2 === 0 ? oR : iR;
        if (k === 0) x.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        else x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      x.closePath();
      x.fill();
    }
  }

  x.strokeStyle = "#fff";
  x.lineWidth = sz * 0.006;
  for (let gi = 0; gi < g; gi++) {
    for (let gj = 0; gj < g; gj++) {
      const cx = cl * 0.5 + gi * cl;
      const cy = cl * 0.5 + gj * cl;
      if (gi < g - 1) {
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + cl, cy);
        x.stroke();
      }
      if (gj < g - 1) {
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx, cy + cl);
        x.stroke();
      }
    }
  }
  return new THREE.CanvasTexture(c);
}
