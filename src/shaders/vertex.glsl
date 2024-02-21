uniform float uSize;
uniform float uBrightness;
uniform float uTime;

attribute vec3 aRandomness;
attribute float aSize;

varying vec3 vColor;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  float angle = atan(modelPosition.x, modelPosition.z);
  float distanceFromCenter = length(modelPosition.xz);
  float angleOffset = (1.0 / distanceFromCenter) * uTime * 0.5;
  angle += angleOffset;
  modelPosition.x = sin(angle) * distanceFromCenter;
  modelPosition.z = cos(angle) * distanceFromCenter;

  modelPosition.xyz += aRandomness;

  vec4 viewPosition = viewMatrix * modelPosition;

  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  gl_PointSize = uSize * aSize;
  gl_PointSize *= ( uBrightness / - viewPosition.z );

  vColor = color;
}
