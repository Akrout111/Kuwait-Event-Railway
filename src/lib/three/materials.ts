/**
 * Three.js Material Definitions for Islamic Geometric 3D Scenes
 * Premium glass and metal materials with environment mapping
 */

import * as THREE from "three";

/* ═══════════════════════════════
   Glass Materials — Transmission, IOR, Dispersion
   ═══════════════════════════════ */

export const goldGlass = new THREE.MeshPhysicalMaterial({
  color: 0xd4a843,
  metalness: 0.05,
  roughness: 0.05,
  transmission: 0.82,
  thickness: 1.5,
  ior: 1.45,
  dispersion: 0.1,
  attenuationColor: new THREE.Color(0xd4a843),
  attenuationDistance: 1.5,
  envMapIntensity: 2.8,
  transparent: true,
  side: THREE.DoubleSide,
  specularIntensity: 1.0,
  specularColor: new THREE.Color(0xffe8b0),
});

export const amberGlass = new THREE.MeshPhysicalMaterial({
  color: 0xb8722d,
  metalness: 0.08,
  roughness: 0.06,
  transmission: 0.78,
  thickness: 2.0,
  ior: 1.52,
  dispersion: 0.07,
  attenuationColor: new THREE.Color(0xb8722d),
  attenuationDistance: 1.3,
  envMapIntensity: 2.2,
  transparent: true,
  side: THREE.DoubleSide,
  specularIntensity: 1.0,
  specularColor: new THREE.Color(0xffcc80),
});

export const roseGoldGlass = new THREE.MeshPhysicalMaterial({
  color: 0xc4836a,
  metalness: 0.06,
  roughness: 0.05,
  transmission: 0.8,
  thickness: 1.6,
  ior: 1.48,
  dispersion: 0.06,
  attenuationColor: new THREE.Color(0xc4836a),
  attenuationDistance: 1.6,
  iridescence: 0.3,
  iridescenceIOR: 1.3,
  envMapIntensity: 2.5,
  transparent: true,
  side: THREE.DoubleSide,
  specularIntensity: 1.0,
  specularColor: new THREE.Color(0xffd0b0),
});

export const deepAmberGlass = new THREE.MeshPhysicalMaterial({
  color: 0x8b5a2b,
  metalness: 0.1,
  roughness: 0.07,
  transmission: 0.72,
  thickness: 2.5,
  ior: 1.55,
  dispersion: 0.12,
  attenuationColor: new THREE.Color(0x8b5a2b),
  attenuationDistance: 0.9,
  envMapIntensity: 1.8,
  transparent: true,
  side: THREE.DoubleSide,
  specularIntensity: 1.0,
  specularColor: new THREE.Color(0xffb860),
});

export const tealGlass = new THREE.MeshPhysicalMaterial({
  color: 0x1a7a6d,
  metalness: 0.05,
  roughness: 0.04,
  transmission: 0.8,
  thickness: 1.8,
  ior: 1.5,
  dispersion: 0.08,
  attenuationColor: new THREE.Color(0x1a7a6d),
  attenuationDistance: 1.3,
  iridescence: 0.2,
  iridescenceIOR: 1.25,
  envMapIntensity: 2.3,
  transparent: true,
  side: THREE.DoubleSide,
  specularIntensity: 1.0,
  specularColor: new THREE.Color(0x80ffd0),
});

/* ═══════════════════════════════
   Metal Materials
   ═══════════════════════════════ */

export const metalGoldMat = new THREE.MeshPhysicalMaterial({
  color: 0xdaa520,
  metalness: 0.93,
  roughness: 0.08,
  envMapIntensity: 3.5,
  side: THREE.DoubleSide,
  emissive: 0x3a2500,
  emissiveIntensity: 0.2,
  clearcoat: 0.4,
  clearcoatRoughness: 0.15,
});

export const metalAmberMat = new THREE.MeshPhysicalMaterial({
  color: 0xc47f17,
  metalness: 0.88,
  roughness: 0.12,
  envMapIntensity: 2.8,
  side: THREE.DoubleSide,
  emissive: 0x2a1a00,
  emissiveIntensity: 0.12,
});

export const wireGold = new THREE.MeshBasicMaterial({
  color: 0xffd700,
  wireframe: true,
  transparent: true,
  opacity: 0.3,
});

/* ═══════════════════════════════
   Material Arrays for Random Selection
   ═══════════════════════════════ */

export const glassArr = [goldGlass, amberGlass, roseGoldGlass, deepAmberGlass, tealGlass];
export const solidArr = [metalGoldMat, metalAmberMat];
