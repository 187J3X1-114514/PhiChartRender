precision mediump float;
#define numSamples 8
uniform float size; // %10.0%
uniform vec2 screenSize;
uniform sampler2D uTexture;

varying vec2 vTextureCoord;
//比原版更快，但是效果不好
void main() {
    vec3 color = texture2D(uTexture, vTextureCoord).rgb;
    float size_new = size;
    float totalBlurFactor = 0.0;

    for(int i = 0; i < numSamples; i++) {
        float angle = float(i) * 6.28 / float(numSamples);
        vec2 offset = vec2(cos(angle), sin(angle)) * size_new;

        vec2 sampleUV = vTextureCoord + offset / screenSize;
        vec3 sampleColor = texture2D(uTexture, sampleUV).rgb;

        float distance = length(offset) * screenSize.x;
        float blurFactor = smoothstep(size_new - 1.0, size_new + 1.0, distance);

        color += sampleColor * blurFactor;

        totalBlurFactor += blurFactor;
    }

    color /= totalBlurFactor;

    gl_FragColor = vec4(color, 1.0);
}