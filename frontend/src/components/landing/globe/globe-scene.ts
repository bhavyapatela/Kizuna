import * as THREE from "three";
import { isLand } from "./land-mask";

/**
 * Procedural "digital world" globe. No downloaded model or textures at
 * runtime — the earth is a shader sphere, the world map is a dot matrix
 * driven by a generated 1° land bitmask (see scripts/generate-land-mask),
 * activity is seeded dot clusters, and arcs are one merged geometry.
 * Five draw calls total (sphere, atmosphere, map, points, arcs), so
 * 60fps is trivial to hold.
 */

/** Rotation/interaction offsets mutated by GSAP from the canvas layer. */
export interface GlobeState {
  spinOffset: number;
  scrollOffset: number;
  pointerX: number;
  pointerY: number;
}

export interface GlobeScene {
  state: GlobeState;
  uniforms: { uTime: { value: number }; uActivity: { value: number } };
  setSize(width: number, height: number): void;
  /** Advance the simulation. `speed` scales time so pauses ease out. */
  frame(dt: number, speed: number): void;
  render(): void;
  dispose(): void;
}

/** Deterministic PRNG so the globe looks identical on every visit. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function latLonToVector(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Rough continent blobs: [lat, lon, spread°, dots]. Impressionistic, not cartographic. */
const CLUSTERS: Array<[number, number, number, number]> = [
  [52, -110, 13, 55], // Canada
  [40, -95, 11, 60], // United States
  [22, -100, 6, 25], // Mexico
  [-10, -58, 11, 50], // Brazil / Amazon
  [-32, -64, 7, 28], // Southern cone
  [52, 12, 9, 55], // Europe
  [60, 28, 7, 25], // Nordics / Baltics
  [30, 8, 9, 30], // North Africa
  [5, 20, 11, 40], // Central Africa
  [-22, 26, 8, 28], // Southern Africa
  [56, 70, 14, 50], // Russia / Central Asia
  [34, 104, 10, 55], // China
  [21, 78, 8, 48], // India
  [12, 104, 7, 30], // Southeast Asia
  [36, 138, 4, 22], // Japan
  [-25, 134, 8, 32], // Australia
];

/** Activity hubs: [lat, lon]. Arcs travel between these. */
const HUBS: Array<[number, number]> = [
  [37.7, -122.4], // San Francisco
  [40.7, -74.0], // New York
  [-23.5, -46.6], // São Paulo
  [51.5, -0.1], // London
  [52.5, 13.4], // Berlin
  [6.5, 3.4], // Lagos
  [25.2, 55.3], // Dubai
  [19.1, 72.9], // Mumbai
  [1.35, 103.8], // Singapore
  [35.7, 139.7], // Tokyo
  [-33.9, 151.2], // Sydney
];

const ARC_PAIRS: Array<[number, number]> = [
  [0, 9], // SF — Tokyo
  [0, 1], // SF — New York
  [1, 3], // New York — London
  [2, 1], // São Paulo — New York
  [2, 5], // São Paulo — Lagos
  [3, 5], // London — Lagos
  [4, 6], // Berlin — Dubai
  [6, 7], // Dubai — Mumbai
  [7, 8], // Mumbai — Singapore
  [8, 9], // Singapore — Tokyo
  [8, 10], // Singapore — Sydney
  [3, 4], // London — Berlin
];

const ACCENT = new THREE.Color("#3b82f6");
const ACCENT_SOFT = new THREE.Color("#7dd3fc");
const ARC_SAMPLES = 48;

function buildGlobeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uAccent: { value: ACCENT } },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uAccent;
      varying vec3 vNormal;
      void main() {
        float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.6);
        vec3 base = mix(vec3(0.028, 0.041, 0.075), vec3(0.048, 0.075, 0.13), vNormal.y * 0.5 + 0.5);
        gl_FragColor = vec4(base + uAccent * fresnel * 0.4, 1.0);
      }
    `,
  });
}

function buildAtmosphereMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uAccent: { value: ACCENT } },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uAccent;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2);
        gl_FragColor = vec4(uAccent, 1.0) * intensity * 0.5;
      }
    `,
  });
}

interface PointsBuild {
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
}

/**
 * Dot-matrix world map: latitude rings sampled against the land bitmask.
 * Steady and dim — the geographic backdrop the activity layer sits on.
 */
function buildLandDots(
  uActivity: { value: number },
  uScale: { value: number },
): PointsBuild {
  const rand = mulberry32(42);
  const positions: number[] = [];
  const fades: number[] = [];

  let ring = 0;
  for (let lat = -78; lat <= 84; lat += 1.5, ring++) {
    const ringCount = Math.max(
      8,
      Math.round(280 * Math.cos((lat * Math.PI) / 180)),
    );
    const offset = ring % 2 === 0 ? 0 : 0.5;
    for (let i = 0; i < ringCount; i++) {
      const lon = -180 + ((i + offset) * 360) / ringCount;
      if (!isLand(lat, lon)) continue;
      const vector = latLonToVector(lat, lon, 1.001);
      positions.push(vector.x, vector.y, vector.z);
      fades.push(0.75 + rand() * 0.25);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setAttribute(
    "aFade",
    new THREE.BufferAttribute(new Float32Array(fades), 1),
  );

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uActivity,
      uScale,
      uMapColor: { value: new THREE.Color("#5f7fb8") },
    },
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      uniform float uScale;
      attribute float aFade;
      varying float vFade;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vFade = aFade;
        gl_PointSize = max(1.15 * uScale / -mvPosition.z, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uActivity;
      uniform vec3 uMapColor;
      varying float vFade;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        // Map keeps a faint presence pre-entrance, brightens with activity.
        float alpha = smoothstep(0.5, 0.16, d) * vFade * 0.4 * (0.35 + 0.65 * uActivity);
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(uMapColor, alpha);
      }
    `,
  });

  return { geometry, material };
}

function buildActivityPoints(
  uTime: { value: number },
  uActivity: { value: number },
  uScale: { value: number },
): PointsBuild {
  const rand = mulberry32(20260803);
  const spherical: THREE.Vector3[] = [];
  const meta: Array<{ size: number; intensity: number }> = [];

  // Triangular distribution ≈ gaussian-ish scatter around a center.
  const jitter = () => (rand() + rand() + rand()) / 1.5 - 1;

  for (const [lat, lon, spread, count] of CLUSTERS) {
    for (let i = 0; i < count; i++) {
      // Resample until the dot lands on an actual landmass so activity
      // hugs real coastlines (a stray offshore dot is fine after 8 tries).
      let dotLat = lat;
      let dotLon = lon;
      for (let attempt = 0; attempt < 8; attempt++) {
        dotLat = lat + jitter() * spread;
        dotLon = lon + jitter() * spread * 1.35;
        if (isLand(dotLat, dotLon)) break;
      }
      spherical.push(latLonToVector(dotLat, dotLon, 1.008));
      meta.push({ size: 1.7 + rand() * 1.3, intensity: 0.55 + rand() * 0.4 });
    }
  }
  for (const [lat, lon] of HUBS) {
    spherical.push(latLonToVector(lat, lon, 1.01));
    meta.push({ size: 4.0, intensity: 1.0 });
  }

  const total = spherical.length;
  const positions = new Float32Array(total * 3);
  const phases = new Float32Array(total);
  const sizes = new Float32Array(total);
  const intensities = new Float32Array(total);

  spherical.forEach((vector, index) => {
    positions.set([vector.x, vector.y, vector.z], index * 3);
    phases[index] = rand() * Math.PI * 2;
    sizes[index] = meta[index].size;
    intensities[index] = meta[index].intensity;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aIntensity", new THREE.BufferAttribute(intensities, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime,
      uActivity,
      uScale,
      uAccent: { value: ACCENT },
      uAccentSoft: { value: ACCENT_SOFT },
    },
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uScale;
      attribute float aPhase;
      attribute float aSize;
      attribute float aIntensity;
      varying float vPulse;
      varying float vIntensity;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vPulse = 0.72 + 0.28 * sin(uTime * 1.3 + aPhase);
        vIntensity = aIntensity;
        gl_PointSize = max(aSize * uScale * vPulse / -mvPosition.z, 1.6);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uActivity;
      uniform vec3 uAccent;
      uniform vec3 uAccentSoft;
      varying float vPulse;
      varying float vIntensity;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        float alpha = smoothstep(0.5, 0.12, d) * vPulse * vIntensity * uActivity;
        if (alpha < 0.01) discard;
        vec3 color = mix(uAccent, uAccentSoft, vIntensity * 0.6);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });

  return { geometry, material };
}

function buildArcs(
  uTime: { value: number },
  uActivity: { value: number },
): PointsBuild {
  const rand = mulberry32(11);
  const segmentCount = ARC_PAIRS.length * (ARC_SAMPLES - 1);
  const positions = new Float32Array(segmentCount * 2 * 3);
  const progress = new Float32Array(segmentCount * 2);
  const offsets = new Float32Array(segmentCount * 2);

  let cursor = 0;
  for (const [fromIndex, toIndex] of ARC_PAIRS) {
    const from = latLonToVector(...HUBS[fromIndex], 1.005);
    const to = latLonToVector(...HUBS[toIndex], 1.005);
    const lift = 1 + 0.18 + 0.3 * (from.angleTo(to) / Math.PI);
    const mid = from.clone().add(to).normalize().multiplyScalar(lift);
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const samples = curve.getPoints(ARC_SAMPLES - 1);
    const phase = rand();

    for (let i = 0; i < ARC_SAMPLES - 1; i++) {
      for (const [point, t] of [
        [samples[i], i / (ARC_SAMPLES - 1)],
        [samples[i + 1], (i + 1) / (ARC_SAMPLES - 1)],
      ] as Array<[THREE.Vector3, number]>) {
        positions.set([point.x, point.y, point.z], cursor * 3);
        progress[cursor] = t;
        offsets[cursor] = phase;
        cursor += 1;
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aT", new THREE.BufferAttribute(progress, 1));
  geometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime,
      uActivity,
      uAccent: { value: ACCENT },
      uAccentSoft: { value: ACCENT_SOFT },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aT;
      attribute float aOffset;
      varying float vT;
      varying float vOffset;
      void main() {
        vT = aT;
        vOffset = aOffset;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uActivity;
      uniform vec3 uAccent;
      uniform vec3 uAccentSoft;
      varying float vT;
      varying float vOffset;
      void main() {
        // A packet of light travels each arc on its own phase.
        float head = fract(uTime * 0.09 + vOffset);
        float distance = abs(vT - head);
        distance = min(distance, 1.0 - distance);
        float pulse = smoothstep(0.055, 0.0, distance);
        float alpha = (0.085 + pulse * 0.6) * uActivity;
        vec3 color = mix(uAccent, uAccentSoft, vT);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });

  return { geometry, material };
}

export function createGlobeScene(canvas: HTMLCanvasElement): GlobeScene | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    // WebGL unavailable — the static placeholder behind the canvas stays.
    return null;
  }
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
  camera.position.z = 3.4;

  const uTime = { value: 0 };
  const uActivity = { value: 0 };
  const uScale = { value: 1 };

  const group = new THREE.Group();
  scene.add(group);

  const globeGeometry = new THREE.SphereGeometry(1, 48, 48);
  const globeMaterial = buildGlobeMaterial();
  group.add(new THREE.Mesh(globeGeometry, globeMaterial));

  const atmosphereGeometry = new THREE.SphereGeometry(1.16, 48, 48);
  const atmosphereMaterial = buildAtmosphereMaterial();
  group.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));

  const landDots = buildLandDots(uActivity, uScale);
  group.add(new THREE.Points(landDots.geometry, landDots.material));

  const points = buildActivityPoints(uTime, uActivity, uScale);
  group.add(new THREE.Points(points.geometry, points.material));

  const arcs = buildArcs(uTime, uActivity);
  group.add(new THREE.LineSegments(arcs.geometry, arcs.material));

  const state: GlobeState = {
    spinOffset: 0,
    scrollOffset: 0,
    pointerX: 0,
    pointerY: 0,
  };

  const disposables: Array<{ dispose(): void }> = [
    globeGeometry,
    globeMaterial,
    atmosphereGeometry,
    atmosphereMaterial,
    landDots.geometry,
    landDots.material,
    points.geometry,
    points.material,
    arcs.geometry,
    arcs.material,
  ];

  return {
    state,
    uniforms: { uTime, uActivity },
    setSize(width, height) {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      uScale.value = (pixelRatio * height) / 105;
    },
    frame(dt, speed) {
      uTime.value += dt * speed;
      // Base of -0.3 rad parks the Americas facing the camera once the
      // entrance spin (+0.55) settles (calibrated visually in-browser).
      group.rotation.set(
        0.3 + state.pointerY,
        -0.3 +
          uTime.value * 0.04 +
          state.spinOffset +
          state.scrollOffset +
          state.pointerX,
        -0.08,
      );
    },
    render() {
      renderer.render(scene, camera);
    },
    dispose() {
      for (const item of disposables) item.dispose();
      renderer.dispose();
    },
  };
}
