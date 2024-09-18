import { Filter, FilterOptions, FilterSystem, FilterWithShader, GlProgram, GpuProgram, ShaderFromResources, Texture } from 'pixi.js';

interface sampler2DUniforms {
    sampler2DUniform: { [key: string]: Texture }
}

export class AdvancedFilter extends Filter {

    public readonly sampler2DUniform: { [key: string]: Texture } = {}

    constructor(options: FilterWithShader & sampler2DUniforms) {
        if (options.sampler2DUniform) {
            let textureStyle: any = {}
            for (let key in options.sampler2DUniform) {
                textureStyle[key] = options.sampler2DUniform[key].source.style
            }
            options.resources = { ...textureStyle, ...options.resources }
        }
        super(options)
        this.sampler2DUniform = options.sampler2DUniform
        
    }

    public apply(
        filterManager: FilterSystem,
        input: Texture,
        output: Texture,
        clearMode: boolean
    ): void {
        //console.log(this)
        for (let name in this.sampler2DUniform) {
            this.resources[name] = this.sampler2DUniform[name].source
        }
        filterManager.applyFilter(this, input, output, clearMode);
    }
    static from(options: FilterOptions & ShaderFromResources & sampler2DUniforms): AdvancedFilter {
        let newOptions = options

        const { gpu, gl, ...rest } = newOptions
        let gpuProgram
        let glProgram
        if (gpu) {
            gpuProgram = GpuProgram.from(gpu)
        }
        if (gl) {
            glProgram = GlProgram.from(gl)
        }
        return new AdvancedFilter({
            gpuProgram,
            glProgram,
            ...rest
        })
    }
}