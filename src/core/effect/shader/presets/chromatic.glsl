precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform float sampleCount; // %3% int 1..64
uniform float power; // %0.01%

void main(){
    vec3 sum;
    vec3 color = vec3(0.0);
    vec2 offset = (vTextureCoord - vec2(0.5)) * vec2(1.0, -1.0);
    int sample_count = int(sampleCount);
    float spread = power;
    for(int i = 0; i < 64; i++){
        if (i >= sample_count) break;
        float t = 2.0 * float(i) / float(sample_count-1); // range 0.0->2.0
        vec3 slice = vec3(1.0-t, 1.0 - abs(t - 1.0), t - 1.0);
        slice = max(slice, 0.0);
        sum += slice;
        vec2 slice_offset = (t-1.0) * spread * offset;
        color += slice * texture2D(uTexture, vTextureCoord + slice_offset).rgb;
    }
    color /= sum;
    gl_FragColor = vec4(color, 1.0);
}
