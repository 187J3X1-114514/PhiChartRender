precision mediump float;

varying lowp vec2 vTextureCoord;
uniform vec2 screenSize;
uniform sampler2D uTexture;

uniform float size; // %10.0%

void main() {
  vec2 factor = screenSize / size;
  float x = floor(vTextureCoord.x * factor.x + 0.5) / factor.x;
  float y = floor(vTextureCoord.y * factor.y + 0.5) / factor.y;
  gl_FragColor = texture2D(uTexture, vec2(x, y));
}