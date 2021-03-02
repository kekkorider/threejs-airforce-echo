varying vec2 vUv;

uniform float uTorsion;

#pragma glslify: Rotate = require('./modules/Rotate.glsl')

void main() {
  vec3 pos = position;
  pos.xz *= Rotate(0.05 * pos.y * uTorsion);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  vUv = uv;
}
