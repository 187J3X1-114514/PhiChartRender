precision mediump float;

attribute vec4 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
varying vec4 vOffset[3];
uniform vec2 resolution;

void SMAAEdgeDetectionVS(vec2 texcoord) {
    vOffset[0] = texcoord.xyxy + resolution.xyxy * vec4(-1.0, 0.0, 0.0, 1.0); // WebGL port note: Changed sign in W component
    vOffset[1] = texcoord.xyxy + resolution.xyxy * vec4(1.0, 0.0, 0.0, -1.0); // WebGL port note: Changed sign in W component
    vOffset[2] = texcoord.xyxy + resolution.xyxy * vec4(-2.0, 0.0, 0.0, 2.0); // WebGL port note: Changed sign in W component
}

void main() {
    gl_Position = a_position;
    v_texCoord = a_texCoord;
    SMAAEdgeDetectionVS(a_texCoord);
}