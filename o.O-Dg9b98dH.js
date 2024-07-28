import{F as nt,t as st,U as le,M as v,G as ot,f as ut,S as dt,u as lt,v as ct,E as d,x as k,y as ht,z as ce,H as he,I as pt,d as p,k as f,p as z,w as pe,J as fe,K as ft,l as me,B as M,q as D,L as w,c as T,N as C,O as mt,b as vt,C as P,Q as gt,V as xt,W as _t,X as ve,e as ge,Y as bt,P as yt,m as kt,R as xe,D as _e,Z as Tt,_ as St,$ as Mt,__tla as wt}from"./o.O.js";import{T as be,B as Ct,d as Pt,__tla as Gt}from"./o.O-BKt_aEOh.js";let ye,g,ke,Te,Se,Me,E,we,_,Ce,Pe,Ge,Ue,Ut=Promise.all([(()=>{try{return wt}catch{}})(),(()=>{try{return Gt}catch{}})()]).then(async()=>{var Oe=`in vec2 vMaskCoord;
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform sampler2D uMaskTexture;

uniform float uAlpha;
uniform vec4 uMaskClamp;

out vec4 finalColor;

void main(void)
{
    float clip = step(3.5,
        step(uMaskClamp.x, vMaskCoord.x) +
        step(uMaskClamp.y, vMaskCoord.y) +
        step(vMaskCoord.x, uMaskClamp.z) +
        step(vMaskCoord.y, uMaskClamp.w));

    // TODO look into why this is needed
    float npmAlpha = uAlpha; 
    vec4 original = texture(uTexture, vTextureCoord);
    vec4 masky = texture(uMaskTexture, vMaskCoord);
    float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);

    original *= (alphaMul * masky.r * uAlpha * clip);

    finalColor = original;
}
`,ze=`in vec2 aPosition;

out vec2 vTextureCoord;
out vec2 vMaskCoord;


uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
uniform mat3 uFilterMatrix;

vec4 filterVertexPosition(  vec2 aPosition )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
       
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(  vec2 aPosition )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

vec2 getFilterCoord( vec2 aPosition )
{
    return  ( uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}   

void main(void)
{
    gl_Position = filterVertexPosition(aPosition);
    vTextureCoord = filterTextureCoord(aPosition);
    vMaskCoord = getFilterCoord(aPosition);
}
`,H=`struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,  
};

struct MaskUniforms {
  uFilterMatrix:mat3x3<f32>,
  uMaskClamp:vec4<f32>,
  uAlpha:f32,
};


@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;

@group(1) @binding(0) var<uniform> filterUniforms : MaskUniforms;
@group(1) @binding(1) var uMaskTexture: texture_2d<f32>;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
    @location(1) filterUv : vec2<f32>,
  };

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);  
}

fn getFilterCoord(aPosition:vec2<f32> ) -> vec2<f32>
{
  return ( filterUniforms.uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}

fn getSize() -> vec2<f32>
{

  
  return gfu.uGlobalFrame.zw;
}
  
@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition),
   getFilterCoord(aPosition)
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) filterUv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    var maskClamp = filterUniforms.uMaskClamp;

     var clip = step(3.5,
        step(maskClamp.x, filterUv.x) +
        step(maskClamp.y, filterUv.y) +
        step(filterUv.x, maskClamp.z) +
        step(filterUv.y, maskClamp.w));

    var mask = textureSample(uMaskTexture, uSampler, filterUv);
    var source = textureSample(uTexture, uSampler, uv);
    
    var npmAlpha = 0.0;

    var alphaMul = 1.0 - npmAlpha * (1.0 - mask.a);

    var a = (alphaMul * mask.r) * clip;

    return vec4(source.rgb, source.a) * a;
}`;class De extends nt{constructor(e){const{sprite:r,...i}=e,a=new st(r.texture),n=new le({uFilterMatrix:{value:new v,type:"mat3x3<f32>"},uMaskClamp:{value:a.uClampFrame,type:"vec4<f32>"},uAlpha:{value:1,type:"f32"}}),s=ot.from({vertex:{source:H,entryPoint:"mainVertex"},fragment:{source:H,entryPoint:"mainFragment"}}),u=ut.from({vertex:ze,fragment:Oe,name:"mask-filter"});super({...i,gpuProgram:s,glProgram:u,resources:{filterUniforms:n,uMaskTexture:r.texture.source}}),this.sprite=r,this._textureMatrix=a}apply(e,r,i,a){this._textureMatrix.texture=this.sprite.texture,e.calculateSpriteMatrix(this.resources.filterUniforms.uniforms.uFilterMatrix,this.sprite).prepend(this._textureMatrix.mapCoord),this.resources.uMaskTexture=this.sprite.texture.source,e.applyFilter(this,r,i,a)}}class W{constructor(e,r){this.state=dt.for2d(),this._batches=Object.create(null),this._geometries=Object.create(null),this.renderer=e,this._adaptor=r,this._adaptor.init(this)}buildStart(e){if(!this._batches[e.uid]){const r=new lt;this._batches[e.uid]=r,this._geometries[r.uid]=new ct}this._activeBatch=this._batches[e.uid],this._activeGeometry=this._geometries[this._activeBatch.uid],this._activeBatch.begin()}addToBatch(e){this._activeBatch.add(e)}break(e){this._activeBatch.break(e)}buildEnd(e){const r=this._activeBatch,i=this._activeGeometry;r.finish(e),i.indexBuffer.setDataWithSize(r.indexBuffer,r.indexSize,!0),i.buffers[0].setDataWithSize(r.attributeBuffer.float32View,r.attributeSize,!1)}upload(e){const r=this._batches[e.uid],i=this._geometries[r.uid];r.dirty&&(r.dirty=!1,i.buffers[0].update(r.attributeSize*4))}execute(e){if(e.action==="startBatch"){const r=e.batcher,i=this._geometries[r.uid];this._adaptor.start(this,i)}this._adaptor.execute(this,e)}destroy(){this.state=null,this.renderer=null,this._adaptor.destroy(),this._adaptor=null;for(const e in this._batches)this._batches[e].destroy();this._batches=null;for(const e in this._geometries)this._geometries[e].destroy();this._geometries=null}}W.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"batch"},Ge={name:"texture-bit",vertex:{header:`

        struct TextureUniforms {
            uTextureMatrix:mat3x3<f32>,
        }

        @group(2) @binding(2) var<uniform> textureUniforms : TextureUniforms;
        `,main:`
            uv = (textureUniforms.uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
            @group(2) @binding(0) var uTexture: texture_2d<f32>;
            @group(2) @binding(1) var uSampler: sampler;

         
        `,main:`
            outColor = textureSample(uTexture, uSampler, vUV);
        `}},Pe={name:"texture-bit",vertex:{header:`
            uniform mat3 uTextureMatrix;
        `,main:`
            uv = (uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
        uniform sampler2D uTexture;

         
        `,main:`
            outColor = texture(uTexture, vUV);
        `}};function Ee(t,e){const r=t.root,i=t.instructionSet;i.reset(),e.batch.buildStart(i),e.blendMode.buildStart(),e.colorMask.buildStart(),r.sortableChildren&&r.sortChildren(),L(r,i,e,!0),e.batch.buildEnd(i),e.blendMode.buildEnd(i)}function S(t,e,r){t.globalDisplayStatus<7||!t.includeInBuild||(t.sortableChildren&&t.sortChildren(),t.isSimple?He(t,e,r):L(t,e,r,!1))}function He(t,e,r){if(t.renderPipeId&&(r.blendMode.setBlendMode(t,t.groupBlendMode,e),t.didViewUpdate=!1,r[t.renderPipeId].addRenderable(t,e)),!t.renderGroup){const i=t.children,a=i.length;for(let n=0;n<a;n++)S(i[n],e,r)}}function L(t,e,r,i){if(!i&&t.renderGroup)r.renderGroup.addRenderGroup(t.renderGroup,e);else{for(let s=0;s<t.effects.length;s++){const u=t.effects[s];r[u.pipe].push(u,t,e)}const a=t.renderPipeId;a&&(r.blendMode.setBlendMode(t,t.groupBlendMode,e),t.didViewUpdate=!1,r[a].addRenderable(t,e));const n=t.children;if(n.length)for(let s=0;s<n.length;s++)S(n[s],e,r);for(let s=t.effects.length-1;s>=0;s--){const u=t.effects[s];r[u.pipe].pop(u,t,e)}}}const We=new ce;class Le extends he{constructor(){super(),this.filters=[new De({sprite:new pt(p.EMPTY)})]}get sprite(){return this.filters[0].sprite}set sprite(e){this.filters[0].sprite=e}}class V{constructor(e){this._activeMaskStage=[],this._renderer=e}push(e,r,i){const a=this._renderer;if(a.renderPipes.batch.break(i),i.add({renderPipeId:"alphaMask",action:"pushMaskBegin",mask:e,canBundle:!1,maskedContainer:r}),e.renderMaskToTexture){const n=e.mask;n.includeInBuild=!0,S(n,i,a.renderPipes),n.includeInBuild=!1}a.renderPipes.batch.break(i),i.add({renderPipeId:"alphaMask",action:"pushMaskEnd",mask:e,maskedContainer:r,canBundle:!1})}pop(e,r,i){this._renderer.renderPipes.batch.break(i),i.add({renderPipeId:"alphaMask",action:"popMaskEnd",mask:e,canBundle:!1})}execute(e){const r=this._renderer,i=e.mask.renderMaskToTexture;if(e.action==="pushMaskBegin"){const a=k.get(Le);if(i){e.mask.mask.measurable=!0;const n=ht(e.mask.mask,!0,We);e.mask.mask.measurable=!1,n.ceil();const s=be.getOptimalTexture(n.width,n.height,1,!1);r.renderTarget.push(s,!0),r.globalUniforms.push({offset:n,worldColor:4294967295});const u=a.sprite;u.texture=s,u.worldTransform.tx=n.minX,u.worldTransform.ty=n.minY,this._activeMaskStage.push({filterEffect:a,maskedContainer:e.maskedContainer,filterTexture:s})}else a.sprite=e.mask.mask,this._activeMaskStage.push({filterEffect:a,maskedContainer:e.maskedContainer})}else if(e.action==="pushMaskEnd"){const a=this._activeMaskStage[this._activeMaskStage.length-1];i&&(r.renderTarget.pop(),r.globalUniforms.pop()),r.filter.push({renderPipeId:"filter",action:"pushFilter",container:a.maskedContainer,filterEffect:a.filterEffect,canBundle:!1})}else if(e.action==="popMaskEnd"){r.filter.pop();const a=this._activeMaskStage.pop();i&&be.returnTexture(a.filterTexture),k.return(a.filterEffect)}}destroy(){this._renderer=null,this._activeMaskStage=null}}V.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"alphaMask"};class j{constructor(e){this._colorStack=[],this._colorStackIndex=0,this._currentColor=0,this._renderer=e}buildStart(){this._colorStack[0]=15,this._colorStackIndex=1,this._currentColor=15}push(e,r,i){this._renderer.renderPipes.batch.break(i);const a=this._colorStack;a[this._colorStackIndex]=a[this._colorStackIndex-1]&e.mask;const n=this._colorStack[this._colorStackIndex];n!==this._currentColor&&(this._currentColor=n,i.add({renderPipeId:"colorMask",colorMask:n,canBundle:!1})),this._colorStackIndex++}pop(e,r,i){this._renderer.renderPipes.batch.break(i);const a=this._colorStack;this._colorStackIndex--;const n=a[this._colorStackIndex-1];n!==this._currentColor&&(this._currentColor=n,i.add({renderPipeId:"colorMask",colorMask:n,canBundle:!1}))}execute(e){this._renderer.colorMask.setMask(e.colorMask)}destroy(){this._colorStack=null}}j.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"colorMask"};class ${constructor(e){this._maskStackHash={},this._maskHash=new WeakMap,this._renderer=e}push(e,r,i){var a;const n=e,s=this._renderer;s.renderPipes.batch.break(i),s.renderPipes.blendMode.setBlendMode(n.mask,"none",i),i.add({renderPipeId:"stencilMask",action:"pushMaskBegin",mask:e,canBundle:!1});const u=n.mask;u.includeInBuild=!0,this._maskHash.has(n)||this._maskHash.set(n,{instructionsStart:0,instructionsLength:0});const o=this._maskHash.get(n);o.instructionsStart=i.instructionSize,S(u,i,s.renderPipes),u.includeInBuild=!1,s.renderPipes.batch.break(i),i.add({renderPipeId:"stencilMask",action:"pushMaskEnd",mask:e,canBundle:!1});const c=i.instructionSize-o.instructionsStart-1;o.instructionsLength=c;const l=s.renderTarget.renderTarget.uid;(a=this._maskStackHash)[l]??(a[l]=0)}pop(e,r,i){const a=e,n=this._renderer;n.renderPipes.batch.break(i),n.renderPipes.blendMode.setBlendMode(a.mask,"none",i),i.add({renderPipeId:"stencilMask",action:"popMaskBegin",canBundle:!1});const s=this._maskHash.get(e);for(let u=0;u<s.instructionsLength;u++)i.instructions[i.instructionSize++]=i.instructions[s.instructionsStart++];i.add({renderPipeId:"stencilMask",action:"popMaskEnd",canBundle:!1})}execute(e){var r;const i=this._renderer,a=i.renderTarget.renderTarget.uid;let n=(r=this._maskStackHash)[a]??(r[a]=0);e.action==="pushMaskBegin"?(i.renderTarget.ensureDepthStencil(),i.stencil.setStencilMode(f.RENDERING_MASK_ADD,n),n++,i.colorMask.setMask(0)):e.action==="pushMaskEnd"?(i.stencil.setStencilMode(f.MASK_ACTIVE,n),i.colorMask.setMask(15)):e.action==="popMaskBegin"?(i.colorMask.setMask(0),n!==0?i.stencil.setStencilMode(f.RENDERING_MASK_REMOVE,n):(i.renderTarget.clear(null,z.STENCIL),i.stencil.setStencilMode(f.DISABLED,n)),n--):e.action==="popMaskEnd"&&(i.stencil.setStencilMode(f.MASK_ACTIVE,n),i.colorMask.setMask(15)),this._maskStackHash[a]=n}destroy(){this._renderer=null,this._maskStackHash=null,this._maskHash=null}}$.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"stencilMask"},Ce=function(t,e){for(const r in t.attributes){const i=t.attributes[r],a=e[r];a?(i.location??(i.location=a.location),i.format??(i.format=a.format),i.offset??(i.offset=a.offset),i.instance??(i.instance=a.instance)):pe(`Attribute ${r} is not present in the shader, but is present in the geometry. Unable to infer attribute details.`)}Ve(t)};function Ve(t){const{buffers:e,attributes:r}=t,i={},a={};for(const n in e){const s=e[n];i[s.uid]=0,a[s.uid]=0}for(const n in r){const s=r[n];i[s.buffer.uid]+=fe(s.format).stride}for(const n in r){const s=r[n];s.stride??(s.stride=i[s.buffer.uid]),s.start??(s.start=a[s.buffer.uid]),a[s.buffer.uid]+=fe(s.format).stride}}g=[],g[f.NONE]=void 0,g[f.DISABLED]={stencilWriteMask:0,stencilReadMask:0},g[f.RENDERING_MASK_ADD]={stencilFront:{compare:"equal",passOp:"increment-clamp"},stencilBack:{compare:"equal",passOp:"increment-clamp"}},g[f.RENDERING_MASK_REMOVE]={stencilFront:{compare:"equal",passOp:"decrement-clamp"},stencilBack:{compare:"equal",passOp:"decrement-clamp"}},g[f.MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:"equal",passOp:"keep"},stencilBack:{compare:"equal",passOp:"keep"}},Se=class{constructor(t){this._syncFunctionHash=Object.create(null),this._adaptor=t,this._systemCheck()}_systemCheck(){if(!ft())throw new Error("Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.")}ensureUniformGroup(t){const e=this.getUniformGroupData(t);t.buffer||(t.buffer=new me({data:new Float32Array(e.layout.size/4),usage:M.UNIFORM|M.COPY_DST}))}getUniformGroupData(t){return this._syncFunctionHash[t._signature]||this._initUniformGroup(t)}_initUniformGroup(t){const e=t._signature;let r=this._syncFunctionHash[e];if(!r){const i=Object.keys(t.uniformStructures).map(s=>t.uniformStructures[s]),a=this._adaptor.createUboElements(i),n=this._generateUboSync(a.uboElements);r=this._syncFunctionHash[e]={layout:a,syncFunction:n}}return this._syncFunctionHash[e]}_generateUboSync(t){return this._adaptor.generateUboSync(t)}syncUniformGroup(t,e,r){const i=this.getUniformGroupData(t);return t.buffer||(t.buffer=new me({data:new Float32Array(i.layout.size/4),usage:M.UNIFORM|M.COPY_DST})),e||(e=t.buffer.data),r||(r=0),i.syncFunction(t.uniforms,e,r),!0}updateUniformGroup(t){if(t.isStatic&&!t._dirtyId)return!1;t._dirtyId=0;const e=this.syncUniformGroup(t);return t.buffer.update(),e}destroy(){this._syncFunctionHash=null}},_=[{type:"mat3x3<f32>",test:t=>t.value.a!==void 0,ubo:`
            var matrix = uv[name].toArray(true);
            data[offset] = matrix[0];
            data[offset + 1] = matrix[1];
            data[offset + 2] = matrix[2];
            data[offset + 4] = matrix[3];
            data[offset + 5] = matrix[4];
            data[offset + 6] = matrix[5];
            data[offset + 8] = matrix[6];
            data[offset + 9] = matrix[7];
            data[offset + 10] = matrix[8];
        `,uniform:`
            gl.uniformMatrix3fv(ud[name].location, false, uv[name].toArray(true));
        `},{type:"vec4<f32>",test:t=>t.type==="vec4<f32>"&&t.size===1&&t.value.width!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
            data[offset + 2] = v.width;
            data[offset + 3] = v.height;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height) {
                cv[0] = v.x;
                cv[1] = v.y;
                cv[2] = v.width;
                cv[3] = v.height;
                gl.uniform4f(ud[name].location, v.x, v.y, v.width, v.height);
            }
        `},{type:"vec2<f32>",test:t=>t.type==="vec2<f32>"&&t.size===1&&t.value.x!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y) {
                cv[0] = v.x;
                cv[1] = v.y;
                gl.uniform2f(ud[name].location, v.x, v.y);
            }
        `},{type:"vec4<f32>",test:t=>t.type==="vec4<f32>"&&t.size===1&&t.value.red!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
            data[offset + 3] = v.alpha;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue || cv[3] !== v.alpha) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                cv[3] = v.alpha;
                gl.uniform4f(ud[name].location, v.red, v.green, v.blue, v.alpha);
            }
        `},{type:"vec3<f32>",test:t=>t.type==="vec3<f32>"&&t.size===1&&t.value.red!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                gl.uniform3f(ud[name].location, v.red, v.green, v.blue);
            }
        `}],we=function(t,e,r,i){const a=[`
        var v = null;
        var v2 = null;
        var t = 0;
        var index = 0;
        var name = null;
        var arrayOffset = null;
    `];let n=0;for(let u=0;u<t.length;u++){const o=t[u],c=o.data.name;let l=!1,h=0;for(let m=0;m<_.length;m++)if(_[m].test(o.data)){h=o.offset/4,a.push(`name = "${c}";`,`offset += ${h-n};`,_[m][e]||_[m].ubo),l=!0;break}if(!l)if(o.data.size>1)h=o.offset/4,a.push(r(o,h-n));else{const m=i[o.data.type];h=o.offset/4,a.push(`
                    v = uv.${c};
                    offset += ${h-n};
                    ${m};
                `)}n=h}const s=a.join(`
`);return new Function("uv","data","offset",s)};function x(t,e){return`
        for (let i = 0; i < ${t*e}; i++) {
            data[offset + (((i / ${t})|0) * 4) + (i % ${t})] = v[i];
        }
    `}E={f32:`
        data[offset] = v;`,i32:`
        data[offset] = v;`,"vec2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];`,"vec3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];`,"vec4<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];`,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 4] = v[2];
        data[offset + 5] = v[3];`,"mat3x3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];
        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];`,"mat4x4<f32>":`
        for (let i = 0; i < 16; i++) {
            data[offset + i] = v[i];
        }`,"mat3x2<f32>":x(3,2),"mat4x2<f32>":x(4,2),"mat2x3<f32>":x(2,3),"mat4x3<f32>":x(4,3),"mat2x4<f32>":x(2,4),"mat3x4<f32>":x(3,4)},Ue={...E,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];
    `};function je(t,e,r,i,a,n){const s=n?1:-1;return t.identity(),t.a=1/i*2,t.d=s*(1/a*2),t.tx=-1-e*t.a,t.ty=-s-r*t.d,t}const b=new Map;function N(t,e){if(!b.has(t)){const r=new p({source:new D({resource:t,...e})}),i=()=>{b.get(t)===r&&b.delete(t)};r.once("destroy",i),r.source.once("destroy",i),b.set(t,r)}return b.get(t)}function $e(t){const e=t.colorTexture.source.resource;return globalThis.HTMLCanvasElement&&e instanceof HTMLCanvasElement&&document.body.contains(e)}const q=class Re{constructor(e={}){if(this.uid=w("renderTarget"),this.colorTextures=[],this.dirtyId=0,this.isRoot=!1,this._size=new Float32Array(2),this._managedColorTextures=!1,e={...Re.defaultOptions,...e},this.stencil=e.stencil,this.depth=e.depth,this.isRoot=e.isRoot,typeof e.colorTextures=="number"){this._managedColorTextures=!0;for(let r=0;r<e.colorTextures;r++)this.colorTextures.push(new T({width:e.width,height:e.height,resolution:e.resolution,antialias:e.antialias}))}else{this.colorTextures=[...e.colorTextures.map(i=>i.source)];const r=this.colorTexture.source;this.resize(r.width,r.height,r._resolution)}this.colorTexture.source.on("resize",this.onSourceResize,this),(e.depthStencilTexture||this.stencil)&&(e.depthStencilTexture instanceof p||e.depthStencilTexture instanceof T?this.depthStencilTexture=e.depthStencilTexture.source:this.ensureDepthStencilTexture())}get size(){const e=this._size;return e[0]=this.pixelWidth,e[1]=this.pixelHeight,e}get width(){return this.colorTexture.source.width}get height(){return this.colorTexture.source.height}get pixelWidth(){return this.colorTexture.source.pixelWidth}get pixelHeight(){return this.colorTexture.source.pixelHeight}get resolution(){return this.colorTexture.source._resolution}get colorTexture(){return this.colorTextures[0]}onSourceResize(e){this.resize(e.width,e.height,e._resolution,!0)}ensureDepthStencilTexture(){this.depthStencilTexture||(this.depthStencilTexture=new T({width:this.width,height:this.height,resolution:this.resolution,format:"depth24plus-stencil8",autoGenerateMipmaps:!1,antialias:!1,mipLevelCount:1}))}resize(e,r,i=this.resolution,a=!1){this.dirtyId++,this.colorTextures.forEach((n,s)=>{a&&s===0||n.source.resize(e,r,i)}),this.depthStencilTexture&&this.depthStencilTexture.source.resize(e,r,i)}destroy(){this.colorTexture.source.off("resize",this.onSourceResize,this),this._managedColorTextures&&this.colorTextures.forEach(e=>{e.destroy()}),this.depthStencilTexture&&(this.depthStencilTexture.destroy(),delete this.depthStencilTexture)}};q.defaultOptions={width:0,height:0,resolution:1,colorTextures:1,stencil:!1,depth:!1,antialias:!1,isRoot:!1};let G=q;ke=class{constructor(t){this.rootViewPort=new C,this.viewport=new C,this.onRenderTargetChange=new mt("onRenderTargetChange"),this.projectionMatrix=new v,this.defaultClearColor=[0,0,0,0],this._renderSurfaceToRenderTargetHash=new Map,this._gpuRenderTargetHash=Object.create(null),this._renderTargetStack=[],this._renderer=t}finishRenderPass(){this.adaptor.finishRenderPass(this.renderTarget)}renderStart({target:t,clear:e,clearColor:r,frame:i}){this._renderTargetStack.length=0,this.push(t,e,r,i),this.rootViewPort.copyFrom(this.viewport),this.rootRenderTarget=this.renderTarget,this.renderingToScreen=$e(this.rootRenderTarget)}bind(t,e=!0,r,i){const a=this.getRenderTarget(t),n=this.renderTarget!==a;this.renderTarget=a,this.renderSurface=t;const s=this.getGpuRenderTarget(a);(a.pixelWidth!==s.width||a.pixelHeight!==s.height)&&(this.adaptor.resizeGpuRenderTarget(a),s.width=a.pixelWidth,s.height=a.pixelHeight);const u=a.colorTexture,o=this.viewport,c=u.pixelWidth,l=u.pixelHeight;if(!i&&t instanceof p&&(i=t.frame),i){const h=u._resolution;o.x=i.x*h+.5|0,o.y=i.y*h+.5|0,o.width=i.width*h+.5|0,o.height=i.height*h+.5|0}else o.x=0,o.y=0,o.width=c,o.height=l;return je(this.projectionMatrix,0,0,o.width/u.resolution,o.height/u.resolution,!a.isRoot),this.adaptor.startRenderPass(a,e,r,o),n&&this.onRenderTargetChange.emit(a),a}clear(t,e=z.ALL,r){e&&(t&&(t=this.getRenderTarget(t)),this.adaptor.clear(t||this.renderTarget,e,r,this.viewport))}contextChange(){this._gpuRenderTargetHash=Object.create(null)}push(t,e=z.ALL,r,i){const a=this.bind(t,e,r,i);return this._renderTargetStack.push({renderTarget:a,frame:i}),a}pop(){this._renderTargetStack.pop();const t=this._renderTargetStack[this._renderTargetStack.length-1];this.bind(t.renderTarget,!1,null,t.frame)}getRenderTarget(t){return t.isTexture&&(t=t.source),this._renderSurfaceToRenderTargetHash.get(t)??this._initRenderTarget(t)}copyToTexture(t,e,r,i,a){r.x<0&&(i.width+=r.x,a.x-=r.x,r.x=0),r.y<0&&(i.height+=r.y,a.y-=r.y,r.y=0);const{pixelWidth:n,pixelHeight:s}=t;return i.width=Math.min(i.width,n-r.x),i.height=Math.min(i.height,s-r.y),this.adaptor.copyToTexture(t,e,r,i,a)}ensureDepthStencil(){this.renderTarget.stencil||(this.renderTarget.stencil=!0,this.adaptor.startRenderPass(this.renderTarget,!1,null,this.viewport))}destroy(){this._renderer=null,this._renderSurfaceToRenderTargetHash.forEach((t,e)=>{t!==e&&t.destroy()}),this._renderSurfaceToRenderTargetHash.clear(),this._gpuRenderTargetHash=Object.create(null)}_initRenderTarget(t){let e=null;return D.test(t)&&(t=N(t).source),t instanceof G?e=t:t instanceof T&&(e=new G({colorTextures:[t]}),D.test(t.source.resource)&&(e.isRoot=!0),t.once("destroy",()=>{e.destroy();const r=this._gpuRenderTargetHash[e.uid];r&&(this._gpuRenderTargetHash[e.uid]=null,this.adaptor.destroyGpuRenderTarget(r))})),this._renderSurfaceToRenderTargetHash.set(t,e),e}getGpuRenderTarget(t){return this._gpuRenderTargetHash[t.uid]||(this._gpuRenderTargetHash[t.uid]=this.adaptor.initGpuRenderTarget(t))}},ye=class extends vt{constructor({buffer:t,offset:e,size:r}){super(),this.uid=w("buffer"),this._resourceType="bufferResource",this._touched=0,this._resourceId=w("resource"),this._bufferResource=!0,this.destroyed=!1,this.buffer=t,this.offset=e|0,this.size=r,this.buffer.on("change",this.onBufferChange,this)}onBufferChange(){this._resourceId=w("resource"),this.emit("change",this)}destroy(t=!1){this.destroyed=!0,t&&this.buffer.destroy(),this.emit("change",this),this.buffer=null}};class K{constructor(e){this._renderer=e}addRenderable(e,r){this._renderer.renderPipes.batch.break(r),r.add(e)}execute(e){e.isRenderable&&e.render(this._renderer)}destroy(){this._renderer=null}}K.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"customRender"};function Y(t,e){const r=t.instructionSet,i=r.instructions;for(let a=0;a<r.instructionSize;a++){const n=i[a];e[n.renderPipeId].execute(n)}}class J{constructor(e){this._renderer=e}addRenderGroup(e,r){this._renderer.renderPipes.batch.break(r),r.add(e)}execute(e){e.isRenderable&&(this._renderer.globalUniforms.push({worldTransformMatrix:e.worldTransform,worldColor:e.worldColorAlpha}),Y(e,this._renderer.renderPipes),this._renderer.globalUniforms.pop())}destroy(){this._renderer=null}}J.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"renderGroup"};function X(t,e=[]){e.push(t);for(let r=0;r<t.renderGroupChildren.length;r++)X(t.renderGroupChildren[r],e);return e}function Ne(t,e,r){const i=t>>16&255,a=t>>8&255,n=t&255,s=e>>16&255,u=e>>8&255,o=e&255,c=i+(s-i)*r,l=a+(u-a)*r,h=n+(o-n)*r;return(c<<16)+(l<<8)+h}const U=16777215;function Q(t,e){return t===U||e===U?t+e-U:Ne(t,e,.5)}const qe=new P;function Z(t,e=!1){Ke(t);const r=t.childrenToUpdate,i=t.updateTick++;for(const a in r){const n=Number(a),s=r[a],u=s.list,o=s.index;for(let c=0;c<o;c++){const l=u[c];l.parentRenderGroup===t&&l.relativeRenderGroupDepth===n&&ee(l,i,0)}s.index=0}if(e)for(let a=0;a<t.renderGroupChildren.length;a++)Z(t.renderGroupChildren[a],e)}function Ke(t){const e=t.root;let r;if(t.renderGroupParent){const i=t.renderGroupParent;t.worldTransform.appendFrom(e.relativeGroupTransform,i.worldTransform),t.worldColor=Q(e.groupColor,i.worldColor),r=e.groupAlpha*i.worldAlpha}else t.worldTransform.copyFrom(e.localTransform),t.worldColor=e.localColor,r=e.localAlpha;r=r<0?0:r>1?1:r,t.worldAlpha=r,t.worldColorAlpha=t.worldColor+((r*255|0)<<24)}function ee(t,e,r){if(e===t.updateTick)return;t.updateTick=e,t.didChange=!1;const i=t.localTransform;t.updateLocalTransform();const a=t.parent;if(a&&!a.renderGroup?(r=r|t._updateFlags,t.relativeGroupTransform.appendFrom(i,a.relativeGroupTransform),r&&te(t,a,r)):(r=t._updateFlags,t.relativeGroupTransform.copyFrom(i),r&&te(t,qe,r)),!t.renderGroup){const n=t.children,s=n.length;for(let o=0;o<s;o++)ee(n[o],e,r);const u=t.parentRenderGroup;t.renderPipeId&&!u.structureDidChange&&u.updateRenderable(t)}}function te(t,e,r){if(r&gt){t.groupColor=Q(t.localColor,e.groupColor);let i=t.localAlpha*e.groupAlpha;i=i<0?0:i>1?1:i,t.groupAlpha=i,t.groupColorAlpha=t.groupColor+((i*255|0)<<24)}r&xt&&(t.groupBlendMode=t.localBlendMode==="inherit"?e.groupBlendMode:t.localBlendMode),r&_t&&(t.globalDisplayStatus=t.localDisplayStatus&e.globalDisplayStatus),t._updateFlags=0}function Ye(t,e){const{list:r,index:i}=t.childrenRenderablesToUpdate;let a=!1;for(let n=0;n<i;n++){const s=r[n];if(a=e[s.renderPipeId].validateRenderable(s),a)break}return t.structureDidChange=a,a}const Je=new v;class re{constructor(e){this._renderer=e}render({container:e,transform:r}){e.isRenderGroup=!0;const i=e.parent,a=e.renderGroup.renderGroupParent;e.parent=null,e.renderGroup.renderGroupParent=null;const n=this._renderer,s=X(e.renderGroup,[]);let u=Je;r&&(u=u.copyFrom(e.renderGroup.localTransform),e.renderGroup.localTransform.copyFrom(r));const o=n.renderPipes;for(let c=0;c<s.length;c++){const l=s[c];l.runOnRender(),l.instructionSet.renderPipes=o,l.structureDidChange||Ye(l,o),Z(l),l.structureDidChange?(l.structureDidChange=!1,Ee(l,o)):Xe(l),l.childrenRenderablesToUpdate.index=0,n.renderPipes.batch.upload(l.instructionSet)}n.globalUniforms.start({worldTransformMatrix:r?e.renderGroup.localTransform:e.renderGroup.worldTransform,worldColor:e.renderGroup.worldColorAlpha}),Y(e.renderGroup,o),o.uniformBatch&&o.uniformBatch.renderEnd(),r&&e.renderGroup.localTransform.copyFrom(u),e.parent=i,e.renderGroup.renderGroupParent=a}destroy(){this._renderer=null}}re.extension={type:[d.WebGLSystem,d.WebGPUSystem,d.CanvasSystem],name:"renderGroup"};function Xe(t){const{list:e,index:r}=t.childrenRenderablesToUpdate;for(let i=0;i<r;i++){const a=e[i];a.didViewUpdate&&t.updateRenderable(a)}}class ie{constructor(e){this._gpuSpriteHash=Object.create(null),this._renderer=e}addRenderable(e,r){const i=this._getGpuSprite(e);e._didSpriteUpdate&&this._updateBatchableSprite(e,i),this._renderer.renderPipes.batch.addToBatch(i)}updateRenderable(e){const r=this._gpuSpriteHash[e.uid];e._didSpriteUpdate&&this._updateBatchableSprite(e,r),r.batcher.updateElement(r)}validateRenderable(e){const r=e._texture,i=this._getGpuSprite(e);return i.texture._source!==r._source?!i.batcher.checkAndUpdateTexture(i,r):!1}destroyRenderable(e){const r=this._gpuSpriteHash[e.uid];k.return(r),this._gpuSpriteHash[e.uid]=null}_updateBatchableSprite(e,r){e._didSpriteUpdate=!1,r.bounds=e.bounds,r.texture=e._texture}_getGpuSprite(e){return this._gpuSpriteHash[e.uid]||this._initGPUSprite(e)}_initGPUSprite(e){const r=k.get(Ct);return r.renderable=e,r.texture=e._texture,r.bounds=e.bounds,r.roundPixels=this._renderer._roundPixels|e._roundPixels,this._gpuSpriteHash[e.uid]=r,e._didSpriteUpdate=!1,e.on("destroyed",()=>{this.destroyRenderable(e)}),r}destroy(){for(const e in this._gpuSpriteHash)k.return(this._gpuSpriteHash[e]);this._gpuSpriteHash=null,this._renderer=null}}ie.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"sprite"};const R=class Be{constructor(){this.clearBeforeRender=!0,this._backgroundColor=new ve(0),this.color=this._backgroundColor,this.alpha=1}init(e){e={...Be.defaultOptions,...e},this.clearBeforeRender=e.clearBeforeRender,this.color=e.background||e.backgroundColor||this._backgroundColor,this.alpha=e.backgroundAlpha,this._backgroundColor.setAlpha(e.backgroundAlpha)}get color(){return this._backgroundColor}set color(e){this._backgroundColor.setValue(e)}get alpha(){return this._backgroundColor.alpha}set alpha(e){this._backgroundColor.setAlpha(e)}get colorRgba(){return this._backgroundColor.toArray()}destroy(){}};R.extension={type:[d.WebGLSystem,d.WebGPUSystem,d.CanvasSystem],name:"background",priority:0},R.defaultOptions={backgroundAlpha:1,backgroundColor:0,clearBeforeRender:!0};let Qe=R;const y={};ge.handle(d.BlendMode,t=>{if(!t.name)throw new Error("BlendMode extension must have a name property");y[t.name]=t.ref},t=>{delete y[t.name]});class ae{constructor(e){this._isAdvanced=!1,this._filterHash=Object.create(null),this._renderer=e}setBlendMode(e,r,i){if(this._activeBlendMode===r){this._isAdvanced&&this._renderableList.push(e);return}this._activeBlendMode=r,this._isAdvanced&&this._endAdvancedBlendMode(i),this._isAdvanced=!!y[r],this._isAdvanced&&(this._beginAdvancedBlendMode(i),this._renderableList.push(e))}_beginAdvancedBlendMode(e){this._renderer.renderPipes.batch.break(e);const r=this._activeBlendMode;if(!y[r]){pe(`Unable to assign BlendMode: '${r}'. You may want to include: import 'pixi.js/advanced-blend-modes'`);return}let i=this._filterHash[r];i||(i=this._filterHash[r]=new he,i.filters=[new y[r]]);const a={renderPipeId:"filter",action:"pushFilter",renderables:[],filterEffect:i,canBundle:!1};this._renderableList=a.renderables,e.add(a)}_endAdvancedBlendMode(e){this._renderableList=null,this._renderer.renderPipes.batch.break(e),e.add({renderPipeId:"filter",action:"popFilter",canBundle:!1})}buildStart(){this._isAdvanced=!1}buildEnd(e){this._isAdvanced&&this._endAdvancedBlendMode(e)}destroy(){this._renderer=null,this._renderableList=null;for(const e in this._filterHash)this._filterHash[e].destroy();this._filterHash=null}}ae.extension={type:[d.WebGLPipes,d.WebGPUPipes,d.CanvasPipes],name:"blendMode"};const B={png:"image/png",jpg:"image/jpeg",webp:"image/webp"},F=class Fe{constructor(e){this._renderer=e}_normalizeOptions(e,r={}){return e instanceof P||e instanceof p?{target:e,...r}:{...r,...e}}async image(e){const r=new Image;return r.src=await this.base64(e),r}async base64(e){e=this._normalizeOptions(e,Fe.defaultImageOptions);const{format:r,quality:i}=e,a=this.canvas(e);if(a.toBlob!==void 0)return new Promise((n,s)=>{a.toBlob(u=>{if(!u){s(new Error("ICanvas.toBlob failed!"));return}const o=new FileReader;o.onload=()=>n(o.result),o.onerror=s,o.readAsDataURL(u)},B[r],i)});if(a.toDataURL!==void 0)return a.toDataURL(B[r],i);if(a.convertToBlob!==void 0){const n=await a.convertToBlob({type:B[r],quality:i});return new Promise((s,u)=>{const o=new FileReader;o.onload=()=>s(o.result),o.onerror=u,o.readAsDataURL(n)})}throw new Error("Extract.base64() requires ICanvas.toDataURL, ICanvas.toBlob, or ICanvas.convertToBlob to be implemented")}canvas(e){e=this._normalizeOptions(e);const r=e.target,i=this._renderer;if(r instanceof p)return i.texture.generateCanvas(r);const a=i.textureGenerator.generateTexture(e),n=i.texture.generateCanvas(a);return a.destroy(),n}pixels(e){e=this._normalizeOptions(e);const r=e.target,i=this._renderer,a=r instanceof p?r:i.textureGenerator.generateTexture(e),n=i.texture.getPixels(a);return r instanceof P&&a.destroy(),n}texture(e){return e=this._normalizeOptions(e),e.target instanceof p?e.target:this._renderer.textureGenerator.generateTexture(e)}download(e){e=this._normalizeOptions(e);const r=this.canvas(e),i=document.createElement("a");i.download=e.filename??"image.png",i.href=r.toDataURL("image/png"),document.body.appendChild(i),i.click(),document.body.removeChild(i)}log(e){const r=e.width??200;e=this._normalizeOptions(e);const i=this.canvas(e),a=i.toDataURL();console.log(`[Pixi Texture] ${i.width}px ${i.height}px`);const n=["font-size: 1px;",`padding: ${r}px 300px;`,`background: url(${a}) no-repeat;`,"background-size: contain;"].join(" ");console.log("%c ",n)}destroy(){this._renderer=null}};F.extension={type:[d.WebGLSystem,d.WebGPUSystem],name:"extract"},F.defaultImageOptions={format:"png",quality:1};let Ze=F;class et extends p{static create(e){return new p({source:new T(e)})}resize(e,r,i){return this.source.resize(e,r,i),this}}const tt=new C,rt=new ce,it=[0,0,0,0];class ne{constructor(e){this._renderer=e}generateTexture(e){var c;e instanceof P&&(e={target:e,frame:void 0,textureSourceOptions:{},resolution:void 0});const r=e.resolution||this._renderer.resolution,i=e.antialias||this._renderer.view.antialias,a=e.target;let n=e.clearColor;n?n=Array.isArray(n)&&n.length===4?n:ve.shared.setValue(n).toArray():n=it;const s=((c=e.frame)==null?void 0:c.copyTo(tt))||bt(a,rt).rectangle;s.width=Math.max(s.width,1/r)|0,s.height=Math.max(s.height,1/r)|0;const u=et.create({...e.textureSourceOptions,width:s.width,height:s.height,resolution:r,antialias:i}),o=v.shared.translate(-s.x,-s.y);return this._renderer.render({container:a,transform:o,target:u,clearColor:n}),u.source.updateMipmaps(),u}destroy(){this._renderer=null}}ne.extension={type:[d.WebGLSystem,d.WebGPUSystem],name:"textureGenerator"};class se{constructor(e){this._stackIndex=0,this._globalUniformDataStack=[],this._uniformsPool=[],this._activeUniforms=[],this._bindGroupPool=[],this._activeBindGroups=[],this._renderer=e}reset(){this._stackIndex=0;for(let e=0;e<this._activeUniforms.length;e++)this._uniformsPool.push(this._activeUniforms[e]);for(let e=0;e<this._activeBindGroups.length;e++)this._bindGroupPool.push(this._activeBindGroups[e]);this._activeUniforms.length=0,this._activeBindGroups.length=0}start(e){this.reset(),this.push(e)}bind({size:e,projectionMatrix:r,worldTransformMatrix:i,worldColor:a,offset:n}){const s=this._renderer.renderTarget.renderTarget,u=this._stackIndex?this._globalUniformDataStack[this._stackIndex-1]:{projectionData:s,worldTransformMatrix:new v,worldColor:4294967295,offset:new yt},o={projectionMatrix:r||this._renderer.renderTarget.projectionMatrix,resolution:e||s.size,worldTransformMatrix:i||u.worldTransformMatrix,worldColor:a||u.worldColor,offset:n||u.offset,bindGroup:null},c=this._uniformsPool.pop()||this._createUniforms();this._activeUniforms.push(c);const l=c.uniforms;l.uProjectionMatrix=o.projectionMatrix,l.uResolution=o.resolution,l.uWorldTransformMatrix.copyFrom(o.worldTransformMatrix),l.uWorldTransformMatrix.tx-=o.offset.x,l.uWorldTransformMatrix.ty-=o.offset.y,Pt(o.worldColor,l.uWorldColorAlpha,0),c.update();let h;this._renderer.renderPipes.uniformBatch?h=this._renderer.renderPipes.uniformBatch.getUniformBindGroup(c,!1):(h=this._bindGroupPool.pop()||new kt,this._activeBindGroups.push(h),h.setResource(c,0)),o.bindGroup=h,this._currentGlobalUniformData=o}push(e){this.bind(e),this._globalUniformDataStack[this._stackIndex++]=this._currentGlobalUniformData}pop(){this._currentGlobalUniformData=this._globalUniformDataStack[--this._stackIndex-1],this._renderer.type===xe.WEBGL&&this._currentGlobalUniformData.bindGroup.resources[0].update()}get bindGroup(){return this._currentGlobalUniformData.bindGroup}get uniformGroup(){return this._currentGlobalUniformData.bindGroup.resources[0]}_createUniforms(){return new le({uProjectionMatrix:{value:new v,type:"mat3x3<f32>"},uWorldTransformMatrix:{value:new v,type:"mat3x3<f32>"},uWorldColorAlpha:{value:new Float32Array(4),type:"vec4<f32>"},uResolution:{value:[0,0],type:"vec2<f32>"}},{isStatic:!0})}destroy(){this._renderer=null}}se.extension={type:[d.WebGLSystem,d.WebGPUSystem,d.CanvasSystem],name:"globalUniforms"};let oe=!1;const ue="8.2.1";function at(t){if(!oe){if(_e.get().getNavigator().userAgent.toLowerCase().indexOf("chrome")>-1){const e=[`%c  %c  %c  %c  %c PixiJS %c v${ue} (${t}) http://www.pixijs.com/

`,"background: #E72264; padding:5px 0;","background: #6CA2EA; padding:5px 0;","background: #B5D33D; padding:5px 0;","background: #FED23F; padding:5px 0;","color: #FFFFFF; background: #E72264; padding:5px 0;","color: #E72264; background: #FFFFFF; padding:5px 0;"];globalThis.console.log(...e)}else globalThis.console&&globalThis.console.log(`PixiJS ${ue} - ${t} - http://www.pixijs.com/`);oe=!0}}class A{constructor(e){this._renderer=e}init(e){if(e.hello){let r=this._renderer.name;this._renderer.type===xe.WEBGL&&(r+=` ${this._renderer.context.webGLVersion}`),at(r)}}}A.extension={type:[d.WebGLSystem,d.WebGPUSystem,d.CanvasSystem],name:"hello",priority:-2},A.defaultOptions={hello:!1};const I=class Ae{constructor(e){this._renderer=e,this.count=0,this.checkCount=0}init(e){e={...Ae.defaultOptions,...e},this.checkCountMax=e.textureGCCheckCountMax,this.maxIdle=e.textureGCAMaxIdle,this.active=e.textureGCActive}postrender(){this._renderer.renderingToScreen&&(this.count++,this.active&&(this.checkCount++,this.checkCount>this.checkCountMax&&(this.checkCount=0,this.run())))}run(){const e=this._renderer.texture.managedTextures;for(let r=0;r<e.length;r++){const i=e[r];i.autoGarbageCollect&&i.resource&&i._touched>-1&&this.count-i._touched>this.maxIdle&&(i._touched=-1,i.unload())}}destroy(){this._renderer=null}};I.extension={type:[d.WebGLSystem,d.WebGPUSystem],name:"textureGC"},I.defaultOptions={textureGCActive:!0,textureGCAMaxIdle:60*60,textureGCCheckCountMax:600};let de=I;ge.add(de);const O=class Ie{get resolution(){return this.texture.source._resolution}set resolution(e){this.texture.source.resize(this.texture.source.width,this.texture.source.height,e)}init(e){e={...Ie.defaultOptions,...e},e.view&&(Tt(St,"ViewSystem.view has been renamed to ViewSystem.canvas"),e.canvas=e.view),this.screen=new C(0,0,e.width,e.height),this.canvas=e.canvas||_e.get().createCanvas(),this.antialias=!!e.antialias,this.texture=N(this.canvas,e),this.renderTarget=new G({colorTextures:[this.texture],depth:!!e.depth,isRoot:!0}),this.texture.source.transparent=e.backgroundAlpha<1,this.multiView=!!e.multiView,this.autoDensity&&(this.canvas.style.width=`${this.texture.width}px`,this.canvas.style.height=`${this.texture.height}px`),this.resolution=e.resolution}resize(e,r,i){this.texture.source.resize(e,r,i),this.screen.width=this.texture.frame.width,this.screen.height=this.texture.frame.height,this.autoDensity&&(this.canvas.style.width=`${e}px`,this.canvas.style.height=`${r}px`)}destroy(e=!1){(typeof e=="boolean"?e:e!=null&&e.removeView)&&this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas)}};O.extension={type:[d.WebGLSystem,d.WebGPUSystem,d.CanvasSystem],name:"view",priority:0},O.defaultOptions={width:800,height:600,autoDensity:!1,antialias:!1},Te=[Qe,se,A,O,re,de,ne,Ze,Mt],Me=[ae,W,ie,J,V,$,j,K]});export{ye as B,g as G,ke as R,Te as S,Se as U,Ut as __tla,Me as a,E as b,we as c,_ as d,Ce as e,Pe as f,Ge as t,Ue as u};
