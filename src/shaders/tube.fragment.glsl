uniform float uTime;
uniform float uLinesNum;
uniform vec2 uResolution;
uniform vec3 uBgColor;

varying vec2 vUv;

#pragma glslify: Line = require('./modules/Line.glsl')
#pragma glslify: Rand = require('./modules/Rand.glsl')
#pragma glslify: blendMultiply = require('glsl-blend/multiply')
#pragma glslify: blendLinearBurn = require('glsl-blend/linear-burn')

void main() {
  vec3 color = uBgColor;

  // Shadows
  vec2 blackShadowPosition = vec2(0.0, vUv.y + (mod(uTime*1.62, 2.0) - 1.0));
  float blackShadow = abs(blackShadowPosition.y * 2.0 - 1.0);
  blackShadow = 1.0 - smoothstep(0., 1.0, blackShadow);
  blackShadow *= 0.9;

  vec2 whiteShadowPosition = vec2(0.0, vUv.y + mod(uTime, 2.0) - 1.0);
  float whiteShadow = abs(whiteShadowPosition.y * 2.0 - 1.0);
  whiteShadow = smoothstep(0.1, 0.45, whiteShadow);
  // whiteShadow *= 0.9;

  // Generate lines
  float linesNum = float(uLinesNum);
  for (float i = 0.0; i < linesNum; i++) {
    vec2 lv = vUv;
    lv.y = 1.0 - lv.y;
    float r = Rand(vec2(i+1.0, 0.0));

    lv.x += sin(lv.y*5.0 - uTime*r*10.4) * (1.0 - r)*0.013;
    lv.x -= sin(lv.y*11.0 - uTime*r*13.0) * (1.0 - r)*0.01;

    // the thickness of the line goes from 1 to
    float thickness = max(sin(lv.y)*2., 1.);

    float line = Line(
      lv,
      vec2((i+1.) * (1.0 / linesNum), 0.0),
      vec2((i+1.) * (1.0 / linesNum), 1.0),
      thickness,
      uResolution
    );

    line *= smoothstep(0.0, 0.1, lv.y);
    line *= (1.0 - r);

    color += line;
  }

  vec3 lineColor = vec3(12., 148., 182.) / 255.;

  vec3 shines = blendLinearBurn(color, vec3(blackShadow), 1.0);
  shines *= lineColor;

  color = blendMultiply(color, shines, 0.95);

  gl_FragColor = vec4(color, 1.);
}
