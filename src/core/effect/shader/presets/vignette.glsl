precision mediump float;

varying lowp vec2 vTextureCoord;
uniform vec2 screenSize;
uniform sampler2D uTexture;

uniform vec4 color; // %0.0, 0.0, 0.0, 1.0%
uniform float extend; // %0.25%
uniform float radius; // %15.0%

void main() {
  vec2 new_uv = vec2(vTextureCoord.x * (1.0 - vTextureCoord.y), vTextureCoord.y * (1.0 - vTextureCoord.x));
  float vig = new_uv.x * new_uv.y * radius;
  vig = pow(vig, extend);
  gl_FragColor = mix(color, texture2D(uTexture, vTextureCoord), vig);
}