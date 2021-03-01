uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uBgColor;

varying vec2 vUv;

#pragma glslify: Line = require('./modules/Line.glsl')
#pragma glslify: Rand = require('./modules/Rand.glsl')

void main() {
  vec3 color = uBgColor;

  // Shadow
  vec2 shadowPosition = vec2(0.0, vUv.y + (mod(uTime, 2.0) - 1.0));
  float shadow = abs(shadowPosition.y * 2.0 - 1.0);
  shadow = 1.0 - smoothstep(0.1, 0.45, shadow);
  shadow *= 0.9;

  // Generate lines
  float linesNum = float(LINES_NUM);
  for (float i = 0.0; i < linesNum; i++) {
    vec2 lv = vUv;
    lv.y = 1.0 - lv.y;
    float r = Rand(vec2(i+1.0, 0.0));

    lv.x += sin(lv.y*5.0 - uTime*r*10.4) * (1.0 - r)*0.013;
    lv.x -= sin(lv.y*11.0 - uTime*r*13.0) * (1.0 - r)*0.01;

    // if (lv.x > 1.0) lv.x -= 2.0;

    // the thickness of the line goes from 1 to
    float thickness = max(sin(lv.y)*2., 1.);

    float line = Line(
      lv,
      vec2((i+1.) * (1.0 / linesNum), 0.0),
      vec2((i+1.) * (1.0 / linesNum), 1.0),
      thickness,
      uResolution
    );

    line *= smoothstep(0.0, 0.3, lv.y);
    line *= (1.0 - r) * 0.7;
    line *= 1.0 - shadow;

    color += line;
  }

  gl_FragColor = vec4(color, 1.);
}
