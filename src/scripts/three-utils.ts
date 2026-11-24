// Three.js utilities and helpers
// Common Three.js setup, shaders, and helper functions

import * as THREE from 'three';

/**
 * Creates a full-screen quad geometry for shader effects
 */
export function createFullScreenQuad(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array([
    -1, -1, 0,
    3, -1, 0,
    -1, 3, 0,
  ]);
  const uvs = new Float32Array([
    0, 0,
    2, 0,
    0, 2,
  ]);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  return geometry;
}

/**
 * Creates a particle field geometry with random positions
 * @param count Number of particles
 * @param radius Spread radius
 */
export function createParticleGeometry(count: number, radius: number = 50): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const alphas = new Float32Array(count);
  const indices = new Float32Array(count);

  const goldColor = new THREE.Color(0xe8b44a);
  const brightGoldColor = new THREE.Color(0xfde047);
  const whiteColor = new THREE.Color(0xfafafa);

  for (let i = 0; i < count; i++) {
    // Spherical distribution
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random()); // Uniform volume distribution

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Random velocities for ambient drift
    velocities[i * 3] = (Math.random() - 0.5) * 0.002;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;

    // Variable sizes
    sizes[i] = Math.random() * 2 + 0.5;

    // Color variation: mostly white, some gold accents
    const colorRand = Math.random();
    if (colorRand < 0.05) {
      colors[i * 3] = goldColor.r;
      colors[i * 3 + 1] = goldColor.g;
      colors[i * 3 + 2] = goldColor.b;
      alphas[i] = 0.8 + Math.random() * 0.2;
    } else if (colorRand < 0.1) {
      colors[i * 3] = brightGoldColor.r;
      colors[i * 3 + 1] = brightGoldColor.g;
      colors[i * 3 + 2] = brightGoldColor.b;
      alphas[i] = 0.6 + Math.random() * 0.4;
    } else {
      colors[i * 3] = whiteColor.r;
      colors[i * 3 + 1] = whiteColor.g;
      colors[i * 3 + 2] = whiteColor.b;
      alphas[i] = 0.1 + Math.random() * 0.4;
    }

    indices[i] = i;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
  geometry.setAttribute('index', new THREE.BufferAttribute(indices, 1));

  return geometry;
}

/**
 * Vertex shader for particle field - GPU-based animation
 */
export const particleVertexShader = `
  attribute vec3 velocity;
  attribute float size;
  attribute vec3 color;
  attribute float alpha;
  attribute float index;
  
  uniform float uTime;
  uniform float uScrollProgress;
  uniform vec2 uMouse;
  uniform float uReducedMotion;
  
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;
  
  // Simple hash function for noise
  float hash(float n) {
    return fract(sin(n * 43758.5453) * 43758.5453);
  }
  
  // 3D noise
  float noise3d(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float n = i.x + i.y * 57.0 + i.z * 113.0;
    float res = mix(
      mix(
        mix(hash(n), hash(n + 1.0), f.x),
        mix(hash(n + 57.0), hash(n + 58.0), f.x),
        f.y
      ),
      mix(
        mix(hash(n + 113.0), hash(n + 114.0), f.x),
        mix(hash(n + 170.0), hash(n + 171.0), f.x),
        f.y
      ),
      f.z
    );
    return res;
  }
  
  void main() {
    vColor = color;
    vAlpha = alpha;
    
    vec3 pos = position;
    
    if (uReducedMotion == 0.0) {
      // Ambient drift using velocity
      pos += velocity * uTime * 1000.0;
      
      // Noise-based organic movement
      vec3 noisePos = position * 0.02 + uTime * 0.0001;
      float n = noise3d(noisePos);
      vec3 noiseVec = vec3(
        noise3d(noisePos + vec3(0, 0, 0)),
        noise3d(noisePos + vec3(100, 0, 0)),
        noise3d(noisePos + vec3(0, 100, 0))
      );
      pos += (noiseVec - 0.5) * 0.5;
      
      // Mouse influence (subtle)
      vec3 mouseDir = vec3(uMouse.x - 0.5, uMouse.y - 0.5, 0.0) * 0.1;
      float dist = length(pos.xy - mouseDir.xy * 50.0);
      float mouseFalloff = smoothstep(0.0, 30.0, 30.0 - dist);
      pos.xy += mouseDir.xy * mouseFalloff * 0.5;
      
      // Subtle scroll reaction
      pos.z += uScrollProgress * 10.0 * sin(index * 0.1 + uTime * 0.001);
    }
    
    vDepth = pos.z;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * Fragment shader for particle field
 */
export const particleFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;
  
  void main() {
    // Circular particles with soft edges
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
    
    // Add subtle glow
    float glow = smoothstep(0.4, 0.3, dist) * 0.3;
    
    vec3 finalColor = vColor + vec3(1.0, 0.78, 0.0) * glow;
    
    gl_FragColor = vec4(finalColor, alpha);
    
    // Discard invisible particles
    if (gl_FragColor.a < 0.01) discard;
  }
`;

/**
 * Creates a basic Three.js scene setup
 */
export function createBasicScene(container: HTMLElement): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  resize: () => void;
  dispose: () => void;
} {
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 50;
  
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  
  const resize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  
  const dispose = () => {
    renderer.dispose();
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
  
  window.addEventListener('resize', resize);
  
  return { scene, camera, renderer, resize, dispose };
}

/**
 * Creates a noise texture for displacement effects
 */
export function createNoiseTexture(size: number = 256): THREE.DataTexture {
  const data = new Uint8Array(size * size * 3);
  for (let i = 0; i < size * size * 3; i++) {
    data[i] = Math.random() * 255;
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates a radial gradient texture for particle glow
 */
export function createRadialGradientTexture(size: number = 64): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  const center = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy) / center;
      const alpha = Math.max(0, 1 - dist);
      const idx = (y * size + x) * 4;
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = alpha * 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}