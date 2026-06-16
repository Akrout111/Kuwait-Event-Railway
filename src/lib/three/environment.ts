/**
 * Three.js Environment Map Generator
 * Creates a warm gold environment for material reflections
 */

import * as THREE from "three";

export function createEnvironmentMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envS = new THREE.Scene();
  envS.background = new THREE.Color(0x0d0800);

  const ePos = [
    [6, 6, 6], [-6, 4, -6], [0, 12, 0], [6, -4, 6], [-6, -6, 6], [0, 0, -10],
    [5, 3, -5], [-5, -3, 5], [0, 8, 4], [4, -6, -4], [-4, 5, 2], [3, 1, 8],
    [-3, 7, -3], [2, -5, 6], [0, -8, 0], [-8, 2, 3], [7, -3, -7],
  ];

  ePos.forEach((p) => {
    const pl = new THREE.PointLight(0xffd080, 40, 30);
    pl.position.set(p[0], p[1], p[2]);
    envS.add(pl);
  });

  envS.add(new THREE.AmbientLight(0x1a0f00, 3));

  const envMap = pmrem.fromScene(envS, 0.04).texture;
  pmrem.dispose();

  return envMap;
}
