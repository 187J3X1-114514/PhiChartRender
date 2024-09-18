in vec2 vTextureCoord;
in vec4 vColor;

uniform sampler2D uTexture;
uniform float time;
uniform float brightness;
uniform float speed;

void main(void) {
    float iTime = time * speed;
    vec2 iResolution = vec2(1.0);
    vec2 uv = (2.0 * vTextureCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    for(float i = 1.0; i < 15.0; i++) {
        uv.x += 0.6 / i * cos(i * 2.5 * uv.y + iTime);
        uv.y += 0.6 / i * cos(i * 1.5 * uv.x + iTime);
    }

    gl_FragColor = vec4(vec3(0.1) / abs(sin(iTime - uv.y - uv.x)) * brightness, 1.0);
}