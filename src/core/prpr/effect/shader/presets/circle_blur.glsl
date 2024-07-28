precision mediump float;

uniform float size; // %10.0%
uniform vec2 screenSize;
uniform sampler2D uTexture;

varying vec2 vTextureCoord;

void main() {
    vec2 center = vec2(0.5, 0.5);
    vec3 color = texture2D(uTexture, vTextureCoord).rgb;
    float size_new = size / 1.1;
    float totalBlurFactor = 0.0;
    const int numSamples = 8;

    for (int i = 0; i < numSamples; i++) {
        float angle = float(i) * 6.28 / float(numSamples);
        vec2 offset = vec2(cos(angle), sin(angle)) * size_new;

        vec2 sampleUV = vTextureCoord + offset / screenSize;
        vec3 sampleColor = texture2D(uTexture, sampleUV).rgb;

        float distance = length(offset) * screenSize.x;
        float blurFactor = smoothstep(size_new-1.0, size_new+1.0, distance);

        color += sampleColor * blurFactor;

        totalBlurFactor += blurFactor;
    }

    color /= totalBlurFactor;

    gl_FragColor = vec4(color, 1.0);
}
