float Line(vec2 p, vec2 a, vec2 b, float thickness, vec2 resolution) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  float result = smoothstep(0.0, thickness / resolution.x, length(pa - ba*h));
  result = 1. - result;
  return result;
}

#pragma glslify: export(Line)
