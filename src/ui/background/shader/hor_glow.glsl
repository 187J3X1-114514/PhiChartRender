in vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform float pos;
uniform float base_alpha;
uniform vec3 mix_color;
uniform float block_alpha;
uniform vec2 screenSize;

float grayScale(vec3 color) {
    vec3 t = vec3(0.299, 0.587, 0.114);
    return dot(color, t);
}

void main() {
    vec3 color = texture2D(uTexture, vTextureCoord).rgb;
    float n_alpha = smoothstep(-0.08, 1.1, pow(1.0 - abs(vTextureCoord.y - pos), 4.0)) * 0.3;
    vec2 texelSize = vec2(1.0) / screenSize;
    bool _ = false;
    vec2 _pos = vec2(-1.888);
    const int s_r = 5;
    for(int i = -s_r; i <= s_r; i++) {
        for(int j = -s_r; j <= s_r; j++) {
            vec2 offset = vec2(float(i), float(j)) * texelSize;
            vec2 sampleCoord = vTextureCoord + offset;
            vec4 c = texture2D(uTexture, sampleCoord);
            if(grayScale(c.rgb) > 0.3) {
                _ = true;
                _pos = sampleCoord.xy;
            }
        }
    }
    if(!_) {
        color += mix_color * ((n_alpha + (base_alpha * 0.12)) * block_alpha);
    }
    gl_FragColor = vec4(color, n_alpha);
}