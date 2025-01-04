precision mediump float;
uniform float size; // %10.0%
uniform vec2 screenSize;
uniform sampler2D uTexture;
varying vec2 vTextureCoord;

//webgl着色器变量没办法做for循环的索引，只能这样了
//而且死卡死卡的
void main() {
    vec4 c = texture2D(uTexture, vTextureCoord);
    float length = dot(c, c);
    vec2 pixel_size = 1.0 / screenSize;
    float s = size * 0.4;
    const float max_size = 7.0;
    for(float x = -max_size; x < max_size; x++) {
        for(float y = -max_size; y < max_size; ++y) {
            if(y > s)
                break;
            if(y < -s)
                continue;
            if(x * x + y * y > s * s)
                continue;
            vec4 new_c = texture2D(uTexture, vTextureCoord + pixel_size * vec2(x, y));
            float new_length = dot(new_c, new_c);
            if(new_length > length) {
                length = new_length;
                c = new_c;
            }
        }
    }
    gl_FragColor = c;
}