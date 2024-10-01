precision mediump float;

uniform sampler2D uTexture;
uniform vec2 screenSize;
varying vec2 vTextureCoord;
uniform float time;

uniform float iX; // %0.5%
uniform float iY; // %0.5%
uniform float iAngle; // %0.0%
uniform float iZoom; // %1.0%
uniform vec4 iOutsideColor; // %0.0, 0.0, 0.0, 1.0%

mat2 rotateMat(float angle) {
    float rad = radians(angle);
    return mat2(cos(rad), -sin(rad), sin(rad), cos(rad));
}

void main() {
    vec2 uv = vTextureCoord;
    vec2 toCenter = uv - vec2(0.5);
    toCenter *= iZoom;
    uv = vec2(0.5) + toCenter;
    mat2 rot = rotateMat(iAngle);
    uv = uv * screenSize * rot / screenSize;
    vec2 move = vec2(iX, iY) - vec2(0.5);
    uv += move;
    if(uv != clamp(uv, vec2(0.0), vec2(1.0))) {
        gl_FragColor = iOutsideColor;
    } else {
        gl_FragColor = texture2D(uTexture, uv);
    }

}