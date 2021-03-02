uniform float uTime;
uniform float uLinesNum;
uniform float uLinesThickness;
uniform vec2 uResolution;
uniform vec3 uBgColor;
uniform vec3 uLinesColors[3];

varying vec2 vUv;

#pragma glslify: Line = require('./modules/Line.glsl')
#pragma glslify: Rand = require('./modules/Rand.glsl')
#pragma glslify: blendMultiply = require('glsl-blend/multiply')
#pragma glslify: blendLinearBurn = require('glsl-blend/linear-burn')

void main() {
  vec3 color = uBgColor;

  // Shadows
  vec2 blackShadowPosition = vec2(0., vUv.y + (mod(uTime*1.62, 2.) - 1.));
  float blackShadow = abs(blackShadowPosition.y * 2. - 1.);
  blackShadow = 1. - smoothstep(0., 1., blackShadow);

  // Generate lines
  for (float i = 0.; i < uLinesNum; i++) {
    vec2 lv = vUv;
    lv.y = 1. - lv.y;
    float r = Rand(vec2(i+1., 0.));

    lv.x += sin(lv.y*5. - uTime*r*10.4) * (1. - r)*0.013;
    lv.x -= sin(lv.y*11. - uTime*r*13.) * (1. - r)*0.01;

    // the thickness of the line goes from 1 to X
    float thickness = max(sin(lv.y)*uLinesThickness, 1.);

    vec3 line = vec3(Line(
      lv,
      vec2((i+1.) * (1. / uLinesNum), 0.),
      vec2((i+1.) * (1. / uLinesNum), 1.),
      thickness,
      uResolution
    ));

    line *= smoothstep(0., .1, lv.y);
    line *= (1. - r);

    float index = mod(i, 3.);
    line *= uLinesColors[int(index)];

    color += line;
  }

  vec3 shines = blendLinearBurn(color, vec3(blackShadow), 1.);

  color = blendMultiply(color, shines, 1.);

  gl_FragColor = vec4(color, 1.);
}
