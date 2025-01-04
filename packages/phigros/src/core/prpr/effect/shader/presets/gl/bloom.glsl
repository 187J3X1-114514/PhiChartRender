precision highp float;

uniform sampler2D uTexture;
varying vec2 vTextureCoord;

uniform float iThreshold; // %0.01%
uniform float iIntensity; // %1.0%
uniform vec4 iColor; // %1.0, 1.0, 1.0, 1.0%

float grayScale(vec3 color) {
    vec3 t = vec3(0.299, 0.587, 0.114);
    return dot(color, t);
}

void main() {
    vec2 uv = vTextureCoord;
    vec4 colora = texture2D(uTexture, uv).rgba;
    vec3 color = colora.rgb;
    if(grayScale(color) > iThreshold) {
        vec3 offset = color * (pow(2.0, iIntensity) - 1.0) * iColor.rgb;
        color = mix(offset, color, 1.0 / pow(2.0, iIntensity));
    }
    gl_FragColor = vec4(color, colora.a);
}