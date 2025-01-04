precision mediump float;

varying lowp vec2 vTextureCoord;
uniform sampler2D uTexture;

uniform float factor; // %1.0% 0..1

void main() {
    vec3 color = texture2D(uTexture, vTextureCoord).xyz;
    vec3 lum = vec3(0.299, 0.587, 0.114);
    vec3 gray = vec3(dot(lum, color));
    gl_FragColor = vec4(mix(color, gray, factor), 1.0);
}
