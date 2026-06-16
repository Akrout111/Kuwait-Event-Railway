/**
 * Custom GLSL Shaders for Three.js Post-Processing
 * Cinematic color grading, caustics, volumetric beams, particles, orbs
 */

export const SkyShader = {
  vertexShader: `
    varying vec3 vP;
    void main() {
      vP = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vP;
    void main() {
      float y = normalize(vP).y;
      vec3 top = vec3(0.02, 0.04, 0.12);
      vec3 mid = vec3(0.008, 0.015, 0.05);
      vec3 bot = vec3(0.001, 0.001, 0.005);
      float t = y * 0.5 + 0.5;
      vec3 c = mix(bot, mid, smoothstep(0.0, 0.4, t));
      c = mix(c, top, smoothstep(0.4, 1.0, t));
      gl_FragColor = vec4(c, 1.0);
    }
  `,
};

export const OrbShader = {
  vertexShader: `
    varying vec3 vN;
    void main() {
      vN = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vN;
    uniform vec3 uColor;
    void main() {
      float rim = pow(1.0 - abs(vN.z), 3.0);
      float core = 1.0 - smoothstep(0.0, 0.5, 1.0 - abs(vN.z));
      gl_FragColor = vec4(uColor * 2.0, rim * 0.7 + core * 0.3);
    }
  `,
};

export const BeamShader = {
  vertexShader: `
    varying vec2 vUv;
    varying float vD;
    void main() {
      vUv = uv;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vD = -mv.z;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying float vD;
    uniform float uTime;
    uniform float uOp;
    uniform vec3 uColor;
    void main() {
      float hF = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
      float vF = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.4, vUv.y);
      float pulse = 0.55 + 0.45 * sin(uTime * 0.3 + vUv.y * 3.0);
      float dF = smoothstep(150.0, 4.0, vD);
      float a = hF * vF * pulse * dF * uOp;
      gl_FragColor = vec4(uColor, a);
    }
  `,
};

export const CausticShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColor;

    vec2 h2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5);
    }

    float vor(vec2 p, float t) {
      vec2 n = floor(p), f = fract(p);
      float d = 1.0;
      for (int j = -1; j <= 1; j++)
        for (int i = -1; i <= 1; i++) {
          vec2 g = vec2(float(i), float(j)), o = h2(n + g);
          o = 0.5 + 0.5 * sin(t * 0.35 + 6.28 * o);
          d = min(d, length(g + o - f));
        }
      return d;
    }

    void main() {
      vec2 p = vUv * 5.0;
      float v1 = vor(p, uTime), v2 = vor(p * 1.5 + 3.0, uTime * 1.3);
      float c = pow(max(1.0 - v1, 0.0), 3.5) * 0.6 + pow(max(1.0 - v2, 0.0), 3.5) * 0.4;
      float e = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x) *
                smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
      gl_FragColor = vec4(uColor, c * e * 0.08);
    }
  `,
};

export const ParticleShader = {
  vertexShader: `
    attribute float aSize;
    attribute float aPhase;
    attribute float aBright;
    attribute float aType;
    uniform float uTime;
    varying float vAlpha;
    varying float vBr;
    varying float vType;

    void main() {
      vec3 pos = position;
      float t = uTime;
      pos.y += sin(t * 0.22 + aPhase) * 0.7 + sin(t * 0.57 + aPhase * 1.7) * 0.3 + sin(t * 1.1 + aPhase * 0.4) * 0.12;
      pos.x += cos(t * 0.17 + aPhase * 1.3) * 0.5 + cos(t * 0.43 + aPhase * 0.6) * 0.2;
      pos.z += sin(t * 0.1 + aPhase * 0.7) * 0.25;
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      float dist = -mv.z;
      vBr = aBright;
      vType = aType;
      float twSpd = mix(0.7, 2.5, step(1.5, aSize));
      vAlpha = aBright * (0.35 + 0.65 * sin(t * twSpd + aPhase * 3.0));
      gl_PointSize = max(aSize * (200.0 / max(dist, 1.0)), 0.5);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: `
    uniform vec3 uGold;
    uniform vec3 uTeal;
    uniform vec3 uWarm;
    varying float vAlpha;
    varying float vBr;
    varying float vType;

    void main() {
      float d = length(gl_PointCoord - 0.5) * 2.0;
      float alpha = pow(max(1.0 - d, 0.0), 2.0) * vAlpha * 0.8;
      vec3 col = vType > 0.5 ? mix(uTeal, uWarm, vBr) : mix(uGold, uWarm, vBr);
      gl_FragColor = vec4(col, alpha);
    }
  `,
};

export const CinematicShader = {
  uniforms: {
    tDiffuse: { value: null as import("three").Texture | null },
    uTime: { value: 0 },
    uRes: { value: [0, 0] as number[] },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform vec2 uRes;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      vec2 ctr = uv - 0.5;
      float dist = length(ctr);

      /* Chromatic aberration at edges */
      float ab = dist * dist * 0.003;
      float cr = texture2D(tDiffuse, uv + ctr * ab).r;
      float cg = texture2D(tDiffuse, uv).g;
      float cb = texture2D(tDiffuse, uv - ctr * ab).b;
      vec3 col = vec3(cr, cg, cb);

      /* Anamorphic streak on brights */
      vec3 flare = vec3(0.0);
      const int FS = 16;
      float fW = 0.03;
      for (int i = -FS; i <= FS; i++) {
        float fi = float(i);
        vec2 fUV = uv + vec2(fi * fW / float(FS), 0.0);
        vec3 fc = texture2D(tDiffuse, fUV).rgb;
        float lum = dot(fc, vec3(0.299, 0.587, 0.114));
        float w = 1.0 - abs(fi) / float(FS);
        w *= w;
        flare += fc * w * step(0.7, lum);
      }
      flare /= float(FS * 2 + 1);
      col += flare * 0.08;

      /* Color grading */
      col = pow(col, vec3(0.97));
      col.r += 0.006 * (1.0 - dist);
      col.b += 0.008 * dist;
      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(col, col * vec3(0.96, 1.015, 1.05), smoothstep(0.25, 0.75, lum) * 0.12);

      /* Vignette */
      float vig = smoothstep(0.92, 0.3, dist);
      col *= mix(0.5, 1.0, vig);

      /* Film grain */
      float grain = (fract(sin(dot(uv * (uTime * 0.3 + 0.5), vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.018;
      col += grain;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};
