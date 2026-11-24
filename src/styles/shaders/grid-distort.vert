// Grid distortion vertex shader for How I Work section background
// Creates a subtle grid that distorts based on scroll progress

uniform float uTime;
uniform float uScrollProgress;
uniform vec2 uResolution;

attribute float aIndex;
attribute vec3 aPosition;

varying vec2 vUv;
varying float vDistortion;

void main() {
  vUv = uv;
  
  vec3 pos = aPosition;
  
  // Wave distortion based on scroll progress and time
  float waveX = sin(pos.y * 10.0 + uTime * 0.5) * 0.02 * uScrollProgress;
  float waveY = cos(pos.x * 10.0 + uTime * 0.3) * 0.02 * uScrollProgress;
  float waveZ = sin(pos.x * 5.0 + pos.y * 5.0 + uTime * 0.4) * 0.03 * uScrollProgress;
  
  pos.x += waveX;
  pos.y += waveY;
  pos.z += waveZ;
  
  // Additional noise-based distortion
  float noise = sin(pos.x * 12.34 + pos.y * 56.78 + uTime * 0.2) * 0.01 * uScrollProgress;
  pos.z += noise;
  
  vDistortion = length(vec2(waveX, waveY)) * 50.0;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Line width for grid lines
  gl_PointSize = 1.0;
}