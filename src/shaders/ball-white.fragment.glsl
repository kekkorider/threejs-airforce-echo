// Global
uniform vec2 uResolution;

// Fresnel
uniform float uFresnelInfluence;

// Ball color
uniform vec3 uColor;
uniform float uColorMin;
uniform float uColorMax;

// Varyings to get the Fresnel value
varying vec3 vEyeVector;
varying vec3 vWorldNormal;

#pragma glslify: Fresnel = require(./modules/fresnel.glsl)

void main() {
  vec3 color = vec3(0.);

  float f1 = Fresnel(vEyeVector, vWorldNormal);
  f1 *= uFresnelInfluence;

  // The additional color is faked using a second Fresnel effect
  float f2 = Fresnel(vEyeVector*0.7, vWorldNormal*0.7);
  f2 = smoothstep(uColorMin, uColorMax, f2);

  color = mix(color, uColor, f2);
  color = mix(color, vec3(1.0), f1);

  gl_FragColor = vec4(color, 1.0);
}
