// Varyings to get the Fresnel value
varying vec3 vEyeVector;
varying vec3 vWorldNormal;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);;

  vEyeVector = normalize(worldPosition.xyz - cameraPosition);
  vWorldNormal = normalize(modelViewMatrix * vec4(normal, 0.0)).xyz;
}
