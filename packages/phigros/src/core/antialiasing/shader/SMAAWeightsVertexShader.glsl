precision mediump float;

#define SMAA_MAX_SEARCH_STEPS 8
#define SMAA_AREATEX_MAX_DISTANCE 16
#define SMAA_AREATEX_PIXEL_SIZE ( 1.0 / vec2( 160.0, 560.0 ) )
#define SMAA_AREATEX_SUBTEX_SIZE ( 1.0 / 7.0 )

uniform vec2 resolution;
attribute vec4 a_position;
attribute vec2 a_texCoord;
varying vec2 vUv;
varying vec4 vOffset[3];
varying vec2 vPixcoord;

void SMAABlendingWeightCalculationVS(vec2 texcoord) {
    vPixcoord = texcoord / resolution;

			// We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
    vOffset[0] = texcoord.xyxy + resolution.xyxy * vec4(-0.25, 0.125, 1.25, 0.125); // WebGL port note: Changed sign in Y and W components
    vOffset[1] = texcoord.xyxy + resolution.xyxy * vec4(-0.125, 0.25, -0.125, -1.25); // WebGL port note: Changed sign in Y and W components

			// And these for the searches, they indicate the ends of the loops:
    vOffset[2] = vec4(vOffset[0].xz, vOffset[1].yw) + vec4(-2.0, 2.0, -2.0, 2.0) * resolution.xxyy * float(SMAA_MAX_SEARCH_STEPS);

}

void main() {
    vUv = a_texCoord;
    SMAABlendingWeightCalculationVS(vUv);
    gl_Position = a_position;

}