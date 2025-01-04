//https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/SMAAShader.js

import { UniformType } from '@/gl/Shader';
import SMAABlendFragmentShader from './SMAABlendFragmentShader.glsl?raw';
import SMAABlendVertexShader from './SMAABlendVertexShader.glsl?raw';

import SMAAEdgesFragmentShader from './SMAAEdgesFragmentShader.glsl?raw';
import SMAAEdgesVertexShader from './SMAAEdgesVertexShader.glsl?raw';

import SMAAWeightsFragmentShader from './SMAAWeightsFragmentShader.glsl?raw';
import SMAAWeightsVertexShader from './SMAAWeightsVertexShader.glsl?raw';

const SMAAEdgesShader = {

	name: 'SMAAEdgesShader',
	vertexShader: SMAAEdgesVertexShader,
	fragmentShader: SMAAEdgesFragmentShader,
	uniform: {
		tDiffuse: UniformType.TEXTURE_2D,
		resolution: UniformType.VEC2
	}

};

const SMAAWeightsShader = {

	name: 'SMAAWeightsShader',

	uniform: {
		tDiffuse: UniformType.TEXTURE_2D,
		tArea: UniformType.TEXTURE_2D,
		tSearch: UniformType.TEXTURE_2D,
		resolution: UniformType.VEC2
	},
	vertexShader: SMAAWeightsVertexShader,
	fragmentShader: SMAAWeightsFragmentShader,

};

const SMAABlendShader = {

	name: 'SMAABlendShader',
	uniform: {
		tDiffuse: UniformType.TEXTURE_2D,
		tColor: UniformType.TEXTURE_2D,
		resolution: UniformType.VEC2
	},
	vertexShader: SMAABlendVertexShader,
	fragmentShader: SMAABlendFragmentShader,

};

export { SMAAEdgesShader, SMAAWeightsShader, SMAABlendShader };
