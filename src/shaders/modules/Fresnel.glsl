float Fresnel(vec3 eyeVector, vec3 worldNormal) {
	return pow(1.0 + dot(eyeVector, worldNormal), 3.0);
}

#pragma glslify: export(Fresnel);
