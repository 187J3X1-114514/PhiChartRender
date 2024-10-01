in vec2 vTextureCoord;
uniform sampler2D uTexture;

void main(void)
{
    vec2 uvs = vTextureCoord.xy;
    vec4 fg = texture2D(uTexture, vTextureCoord);
    gl_FragColor = fg;

}