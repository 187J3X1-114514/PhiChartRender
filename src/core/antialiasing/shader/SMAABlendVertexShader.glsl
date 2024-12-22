precision mediump float;

uniform vec2 resolution;
attribute vec4 a_position;
attribute vec2 a_texCoord;
varying vec2 vUv;
varying vec4 vOffset[2];

void SMAANeighborhoodBlendingVS(vec2 texcoord) {
    vOffset[0] = texcoord.xyxy + resolution.xyxy * vec4(-1.0, 0.0, 0.0, 1.0); // WebGL port note: Changed sign in W component
    vOffset[1] = texcoord.xyxy + resolution.xyxy * vec4(1.0, 0.0, 0.0, -1.0); // WebGL port note: Changed sign in W component
}

void main() {
    vUv = a_texCoord;
    SMAANeighborhoodBlendingVS(vUv);
    gl_Position = a_position;

}