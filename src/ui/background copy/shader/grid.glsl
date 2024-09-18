in vec2 vTextureCoord;
uniform sampler2D uTexture;

uniform float grid_scale;
uniform float grid_zoom;
uniform float grid_width;
uniform float grid_twist;
uniform vec3 grid_color;
uniform vec3 grid_bloom_color;
uniform float grid_bloom_s;
uniform float grid_bloom_pos;
uniform float base_alpha;

float grayScale(vec3 color) {
    vec3 t = vec3(0.299, 0.587, 0.114);
    return dot(color, t);
}

vec2 distortion(vec2 r, float alpha) {
    return r.xy * (1.0 - alpha * dot(r, r));
}

float grid(vec2 uv, float thickness) {
    vec2 box_uv = fract(uv) * 1.0;
    box_uv = abs(box_uv - 0.5) * 2.0;
    box_uv = box_uv.x + box_uv.y > 1.0 ? 1.0 - box_uv : box_uv;
    float grid0 = smoothstep(0.0, thickness, (box_uv.x));
    float grid1 = smoothstep(0.0, thickness, (1.0 - (box_uv.x + box_uv.y)) / 1.6);
    return 1.0 - min(grid0, grid1);
}

float texture_grid(vec2 uv) {
    vec2 distorted = distortion((uv - 0.5) * grid_scale, 0.5);
    vec2 zoomed = (uv + (distorted * grid_twist)) * grid_zoom + 0.5;
    float brightness = grid(zoomed, grid_width);
    return brightness;
}

vec3 mixColor(vec3 a, vec3 b, float c) {
    vec3 offset = a * (pow(2.0, c) - 1.0) * b.rgb;
    vec3 color = mix(offset, a, 1.0 / pow(2.0, c));
    return color;
}

void main() {
    float result = texture_grid(vTextureCoord);
    vec2 uvs = vTextureCoord.xy;
    float grid_ = 0.0;
    if(result > 0.5) {
        grid_ = (1.0 + result) / 1.6;
    }
    vec3 grid = grid_color * grid_;
    vec4 fg = texture2D(uTexture, vec2(uvs.x, uvs.y));
    //*********
    float n_alpha = smoothstep(-0.08, 1.1, pow(1.0 - abs(vTextureCoord.y - grid_bloom_pos), 4.0));
    vec3 color = (grid.rgb * ((n_alpha * 3.0) + (base_alpha * 8.0))) + fg.rgb + (vec3(0.2863, 0.502, 0.6) * grid_bloom_s * (n_alpha * 0.1 + 0.05) * 1.8);
    //bloom
    gl_FragColor = vec4(color, fg.a);

}