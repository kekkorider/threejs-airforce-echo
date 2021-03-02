mat2 Rotate(float angle) {
  return mat2(
    cos(angle), -sin(angle),
    sin(angle), cos(angle)
  );
}

#pragma glslify: export(Rotate)
