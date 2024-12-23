export class ShaderProgram {
    private gl: WebGL2RenderingContext | WebGLRenderingContext;
    public program: WebGLProgram
    public uniforms: Record<string, Uniform>
    private texUniform: Record<string, { id: number, tex: WebGLTexture | null }> = {}
    constructor(gl: WebGL2RenderingContext | WebGLRenderingContext, vertexShaderSrc: string, fragmentShaderSrc: string, uniforms: Record<string, Uniform> = {}) {
        this.gl = gl
        this.program = this.glCreateShaderProgram(vertexShaderSrc, fragmentShaderSrc)
        this.uniforms = uniforms
        this.setupUniform()
    }
    private compileShaderSource(shader: WebGLShader, src: string) {
        this.gl.shaderSource(shader, src);
        this.gl.compileShader(shader);
    }

    private glCreateShaderProgram(vertexShaderSrc: string, fragmentShaderSrc: string) {
        const gl = this.gl
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        this.compileShaderSource(vertexShader, vertexShaderSrc)
        this.compileShaderSource(fragmentShader, fragmentShaderSrc)

        const message1 = gl.getShaderInfoLog(vertexShader);
        if (message1 != null && message1.length > 0) {
            console.log(vertexShaderSrc)
            throw message1;
        }
        const message2 = gl.getShaderInfoLog(fragmentShader);
        if (message2 != null && message2.length > 0) {
            console.log(fragmentShaderSrc)
            throw message2;
        }

        const program = gl.createProgram()!
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.detachShader(program, vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const linkErrLog = gl.getProgramInfoLog(program);
            throw linkErrLog
        }
        return program
    }
    private setupUniform() {
        const pointPos = [
            -1, 1,
            -1, -1,
            1, -1,
            1, -1,
            1, 1,
            -1, 1,
        ];
        const texCoordPos = [
            0, 1,
            0, 0,
            1, 0,
            1, 0,
            1, 1,
            0, 1
        ];
        const gl = this.gl
        gl.useProgram(this.program);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPos), gl.STATIC_DRAW);
        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoordPos), gl.STATIC_DRAW);
        const a_position = gl.getAttribLocation(this.program, "a_position");
        const a_texCoord = gl.getAttribLocation(this.program, "a_texCoord");
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(
            a_position,
            2,
            gl.FLOAT,
            false,
            Float32Array.BYTES_PER_ELEMENT * 2,
            0
        );
        gl.enableVertexAttribArray(a_position);
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(
            a_texCoord,
            2,
            gl.FLOAT,
            false,
            Float32Array.BYTES_PER_ELEMENT * 2,
            0
        );
        gl.enableVertexAttribArray(a_texCoord);
        let texCount = 0
        for (let name in this.uniforms) {
            if (this.uniforms[name].type == UniformType.TEXTURE_2D) {
                this.texUniform[name] = { id: texCount, tex: null }
                texCount++
            }
        }
    }

    setUniform(uniform: Uniform | string, value: any) {
        this.gl.useProgram(this.program)
        if (typeof uniform == "string") uniform = this.uniforms[uniform]
        const uniLoc = this.gl.getUniformLocation(this.program, uniform.name)
        switch (uniform.type) {
            case UniformType.TEXTURE_2D:
                this.texUniform[uniform.name].tex = value
                this.gl.uniform1i(uniLoc, this.texUniform[uniform.name].id)
                break
            case UniformType.VEC2:
                this.gl.uniform2f(uniLoc, value[0], value[1])
                break
            case UniformType.VEC3:
                this.gl.uniform3f(uniLoc, value[0], value[1], value[2])
                break
            case UniformType.VEC4:
                this.gl.uniform4f(uniLoc, value[0], value[1], value[2], value[3])
                break
            case UniformType.FLOAT:
                this.gl.uniform1f(uniLoc, value[0])
                break
        }
        this.gl.useProgram(null)
    }

    use() {
        this.gl.useProgram(this.program)
        for (let uni in this.texUniform) {
            this.gl.activeTexture(this.gl.TEXTURE0 + this.texUniform[uni].id);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texUniform[uni].tex);
        }
    }

    unuse() {
        this.gl.useProgram(this.program)
        for (let uni in this.texUniform) {
            this.gl.activeTexture(this.gl.TEXTURE0 + this.texUniform[uni].id);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
        this.gl.useProgram(null)
    }
}

export enum UniformType {
    TEXTURE_2D, VEC2, VEC3, VEC4, FLOAT
}

export class Uniform {
    public type: UniformType
    public name: string
    private constructor(type: UniformType, name: string) {
        this.type = type
        this.name = name
    }
    static create(type: UniformType, name: string) {
        return new this(type, name)
    }

    static createUniforms(uniforms: Record<string, UniformType>) {
        let _: Record<string, Uniform> = {}
        for (let name in uniforms) {
            _[name] = this.create(uniforms[name], name)
        }
        return _
    }
}