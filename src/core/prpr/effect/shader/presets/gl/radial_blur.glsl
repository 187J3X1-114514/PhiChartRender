precision mediump float;

varying lowp vec2 vTextureCoord;
uniform sampler2D uTexture;

uniform float centerX; // %0.5% 0..1
uniform float centerY; // %0.5% 0..1
uniform float power; // %0.01% 0..1
uniform float sampleCount; // %6% int 1..64

void main() {
    vec2 direction = vTextureCoord - vec2(centerX, centerY);
    vec3 c = vec3(0.0);
    float f = 1.0 / sampleCount;
    for(float i = 0.0; i < 64.0; ++i) {
        if(i >= sampleCount)
            break;
        c += texture2D(uTexture, vTextureCoord - power * direction * i).rgb * f;
    }
    gl_FragColor.rgb = c;
}
