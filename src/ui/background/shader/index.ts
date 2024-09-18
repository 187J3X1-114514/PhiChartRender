import { Filter } from 'pixi.js';
import defaultShader from '../../../core/prpr/effect/shader/default.vert?raw'

import { default as __grid_shader } from './grid.glsl?raw';
export { __grid_shader as grid_shader };
import { default as __hor_glow } from './hor_glow.glsl?raw';
export { __hor_glow as hor_glow };
import { default as __background_gargantua_a_shader } from './background_gargantua_a.glsl?raw';
export { __background_gargantua_a_shader as background_gargantua_a_shader };
import { default as __background_glow } from './background_glow.glsl?raw';
import { AdvancedFilter } from './AdvancedFilter';
export { __background_glow as background_glow };
import { default as __background_gargantua_b_shader } from './background_gargantua_b.glsl?raw';
export { __background_gargantua_b_shader as background_gargantua_b_shader };
import { default as __background_gargantua_c_shader } from './background_gargantua_c.glsl?raw';
export { __background_gargantua_b_shader as background_gargantua_c_shader };

interface uniData {
    value?: any, type: string
}
export class Shader {
    public filter: Filter
    private uniforms: { [key: string]: uniData } = {}
    private uniforms2: { [key: string]: uniData } = {}
    private uniformsAll: { [key: string]: uniData } = {}
    constructor(_shaderText: string, vars: { [key: string]: uniData },sampler2DUniform:any={}) {
        this.uniforms = {
            time: { value: 0, type: "f32" },
            screenSize: { value: [0, 0], type: "vec2<f32>" }
        };
        this.uniforms2 = vars
        this.uniformsAll = { ...this.uniforms, ...this.uniforms2 }
        this.filter = Filter.from({
            resources: { my: this.uniformsAll },
            gl: {
                vertex: defaultShader,
                fragment: _shaderText
            },
            //sampler2DUniform: sampler2DUniform
        })
        console.log(this.filter, this.uniformsAll, vars)
    }
    update(uniforms: { [key: string]: any[] | number | any }) {
        for (const name in uniforms) {
            this.filter.resources.my.uniforms[name] = uniforms[name]
        }
    }
}