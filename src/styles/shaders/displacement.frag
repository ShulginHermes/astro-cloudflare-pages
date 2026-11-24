// Displacement fragment shader for WebGL hover transitions
// Used in SelectedWork cards for organic distortion effect

uniform sampler2D uTexture;
uniform sampler2D uDisplacementMap;
uniform float uTime;
uniform float uProgress;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  
  // Calculate distance from mouse for interactive distortion
  float dist = length(uv - uMouse);
  float mouseInfluence = smoothstep(0.0, 0.5, 1.0 - dist * 2.0);
  
  // Organic displacement using noise and time
  float displacement = texture2D(uDisplacementMap, uv * 2.0 + uTime * 0.1).r;
  displacement += texture2D(uDisplacementMap, uv * 4.0 - uTime * 0.05).r * 0.5;
  displacement += texture2D(uDisplacementMap, uv * 8.0 + uTime * 0.02).r * 0.25;
  
  // Apply progress-based distortion (0 to 1 on hover)
  float distortAmount = mix(0.0, 0.15, uProgress) * (1.0 + mouseInfluence * 0.5);
  
  // Directional distortion
  vec2 distortDir = normalize(uv - vec2(0.5));
  uv += distortDir * displacement * distortAmount;
  
  // Add subtle chromatic aberration at high progress
  vec3 color;
  if (uProgress > 0.5) {
    float ca = (uProgress - 0.5) * 2.0 * 0.005;
    color.r = texture2D(uTexture, uv + vec2(ca, 0.0)).r;
    color.g = texture2D(uTexture, uv).g;
    color.b = texture2D(uTexture, uv - vec2(ca, 0.0)).b;
  } else {
    color = texture2D(uTexture, uv).rgb;
  }
  
  // Gold tint at edges during transition
  float vignette = 1.0 - length(uv - 0.5) * 0.5;
  color += vec3(1.0, 0.78, 0.0) * (1.0 - vignette) * uProgress * 0.1;
  
  gl_FragColor = vec4(color, 1.0);
}