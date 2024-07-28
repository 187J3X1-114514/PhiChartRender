precision mediump float;

varying lowp vec2 vTextureCoord;
uniform vec2 screenSize;
uniform sampler2D uTexture;

uniform float power; // %-0.1%

void main() {
  vec2 p = vec2(vTextureCoord.x, vTextureCoord.y * screenSize.y / screenSize.x);
  float aspect = screenSize.x / screenSize.y;
  vec2 m = vec2(0.5, 0.5 / aspect);
  vec2 d = p - m;
  float r = sqrt(dot(d, d));

  float new_power = (2.0 * 3.141592 / (2.0 * sqrt(dot(m, m)))) * power;

  float bind = new_power > 0.0? sqrt(dot(m, m)): (aspect < 1.0? m.x: m.y);

  vec2 nuv;
  if (new_power > 0.0)
    nuv = m + normalize(d) * tan(r * new_power) * bind / tan(bind * new_power);
  else
    nuv = m + normalize(d) * atan(r * -new_power * 10.0) * bind / atan(-new_power * bind * 10.0);

  gl_FragColor = texture2D(uTexture, vec2(nuv.x, nuv.y * aspect));
}
