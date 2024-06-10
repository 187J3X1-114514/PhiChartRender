import{w as ce,G as fe,c as me,m as y,__tla as ve}from"./index-1xRD7Acp.js";let z,W,f,D,G,O,k,E,L,B,X,Y,F,xe=Promise.all([(()=>{try{return ve}catch{}})()]).then(async()=>{function S(r,o,e){if(r)for(const t in r){const a=t.toLocaleLowerCase(),l=o[a];if(l){let n=r[t];t==="header"&&(n=n.replace(/@in\s+[^;]+;\s*/g,"").replace(/@out\s+[^;]+;\s*/g,"")),e&&l.push(`//----${e}----//`),l.push(n)}else ce(`${t} placement hook does not exist in shader`)}}const H=/\{\{(.*?)\}\}/g;function V(r){var e;const o={};return(((e=r.match(H))==null?void 0:e.map(t=>t.replace(/[{()}]/g,"")))??[]).forEach(t=>{o[t]=[]}),o}function j(r,o){let e;const t=/@in\s+([^;]+);/g;for(;(e=t.exec(r))!==null;)o.push(e[1])}function I(r,o,e=!1){const t=[];j(o,t),r.forEach(i=>{i.header&&j(i.header,t)});const a=t;e&&a.sort();const l=a.map((i,u)=>`       @location(${u}) ${i},`).join(`
`);let n=o.replace(/@in\s+[^;]+;\s*/g,"");return n=n.replace("{{in}}",`
${l}
`),n}function R(r,o){let e;const t=/@out\s+([^;]+);/g;for(;(e=t.exec(r))!==null;)o.push(e[1])}function N(r){const o=/\b(\w+)\s*:/g.exec(r);return o?o[1]:""}function q(r){const o=/@.*?\s+/g;return r.replace(o,"")}function J(r,o){const e=[];R(o,e),r.forEach(u=>{u.header&&R(u.header,e)});let t=0;const a=e.sort().map(u=>u.indexOf("builtin")>-1?u:`@location(${t++}) ${u}`).join(`,
`),l=e.sort().map(u=>`       var ${q(u)};`).join(`
`),n=`return VSOutput(
                ${e.sort().map(u=>` ${N(u)}`).join(`,
`)});`;let i=o.replace(/@out\s+[^;]+;\s*/g,"");return i=i.replace("{{struct}}",`
${a}
`),i=i.replace("{{start}}",`
${l}
`),i=i.replace("{{return}}",`
${n}
`),i}function w(r,o){let e=r;for(const t in o){const a=o[t];a.join(`
`).length?e=e.replace(`{{${t}}}`,`//-----${t} START-----//
${a.join(`
`)}
//----${t} FINISH----//`):e=e.replace(`{{${t}}}`,"")}return e}const c=Object.create(null),M=new Map;let K=0;function Q({template:r,bits:o}){const e=_(r,o);if(c[e])return c[e];const{vertex:t,fragment:a}=ee(r,o);return c[e]=A(t,a,o),c[e]}function Z({template:r,bits:o}){const e=_(r,o);return c[e]||(c[e]=A(r.vertex,r.fragment,o)),c[e]}function ee(r,o){const e=o.map(n=>n.vertex).filter(n=>!!n),t=o.map(n=>n.fragment).filter(n=>!!n);let a=I(e,r.vertex,!0);a=J(e,a);const l=I(t,r.fragment,!0);return{vertex:a,fragment:l}}function _(r,o){return o.map(e=>(M.has(e)||M.set(e,K++),M.get(e))).sort((e,t)=>e-t).join("-")+r.vertex+r.fragment}function A(r,o,e){const t=V(r),a=V(o);return e.forEach(l=>{S(l.vertex,t,l.name),S(l.fragment,a,l.name)}),{vertex:w(r,t),fragment:w(o,a)}}const re=`
    @in aPosition: vec2<f32>;
    @in aUV: vec2<f32>;

    @out @builtin(position) vPosition: vec4<f32>;
    @out vUV : vec2<f32>;
    @out vColor : vec4<f32>;

    {{header}}

    struct VSOutput {
        {{struct}}
    };

    @vertex
    fn main( {{in}} ) -> VSOutput {

        var worldTransformMatrix = globalUniforms.uWorldTransformMatrix;
        var modelMatrix = mat3x3<f32>(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        var position = aPosition;
        var uv = aUV;

        {{start}}
        
        vColor = vec4<f32>(1., 1., 1., 1.);

        {{main}}

        vUV = uv;

        var modelViewProjectionMatrix = globalUniforms.uProjectionMatrix * worldTransformMatrix * modelMatrix;

        vPosition =  vec4<f32>((modelViewProjectionMatrix *  vec3<f32>(position, 1.0)).xy, 0.0, 1.0);
       
        vColor *= globalUniforms.uWorldColorAlpha;

        {{end}}

        {{return}}
    };
`,oe=`
    @in vUV : vec2<f32>;
    @in vColor : vec4<f32>;
   
    {{header}}

    @fragment
    fn main(
        {{in}}
      ) -> @location(0) vec4<f32> {
        
        {{start}}

        var outColor:vec4<f32>;
      
        {{main}}
        
        return outColor * vColor;
      };
`,te=`
    in vec2 aPosition;
    in vec2 aUV;

    out vec4 vColor;
    out vec2 vUV;

    {{header}}

    void main(void){

        mat3 worldTransformMatrix = uWorldTransformMatrix;
        mat3 modelMatrix = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        vec2 position = aPosition;
        vec2 uv = aUV;
        
        {{start}}
        
        vColor = vec4(1.);
        
        {{main}}
        
        vUV = uv;
        
        mat3 modelViewProjectionMatrix = uProjectionMatrix * worldTransformMatrix * modelMatrix;

        gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);

        vColor *= uWorldColorAlpha;

        {{end}}
    }
`,ne=`
   
    in vec4 vColor;
    in vec2 vUV;

    out vec4 finalColor;

    {{header}}

    void main(void) {
        
        {{start}}

        vec4 outColor;
      
        {{main}}
        
        finalColor = outColor * vColor;
    }
`,ae={name:"global-uniforms-bit",vertex:{header:`
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `}},ie={name:"global-uniforms-bit",vertex:{header:`
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `}};D=function({bits:r,name:o}){const e=Q({template:{fragment:oe,vertex:re},bits:[ae,...r]});return fe.from({name:o,vertex:{source:e.vertex,entryPoint:"main"},fragment:{source:e.fragment,entryPoint:"main"}})},O=function({bits:r,name:o}){return new me({name:o,...Z({template:{vertex:te,fragment:ne},bits:[ie,...r]})})};let m;W={name:"color-bit",vertex:{header:`
            @in aColor: vec4<f32>;
        `,main:`
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `}},k={name:"color-bit",vertex:{header:`
            in vec4 aColor;
        `,main:`
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `}},m={};function ue(r){const o=[];if(r===1)o.push("@group(1) @binding(0) var textureSource1: texture_2d<f32>;"),o.push("@group(1) @binding(1) var textureSampler1: sampler;");else{let e=0;for(let t=0;t<r;t++)o.push(`@group(1) @binding(${e++}) var textureSource${t+1}: texture_2d<f32>;`),o.push(`@group(1) @binding(${e++}) var textureSampler${t+1}: sampler;`)}return o.join(`
`)}function le(r){const o=[];if(r===1)o.push("outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);");else{o.push("switch vTextureId {");for(let e=0;e<r;e++)e===r-1?o.push("  default:{"):o.push(`  case ${e}:{`),o.push(`      outColor = textureSampleGrad(textureSource${e+1}, textureSampler${e+1}, vUV, uvDx, uvDy);`),o.push("      break;}");o.push("}")}return o.join(`
`)}E=function(r){return m[r]||(m[r]={name:"texture-batch-bit",vertex:{header:`
                @in aTextureIdAndRound: vec2<u32>;
                @out @interpolate(flat) vTextureId : u32;
            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `},fragment:{header:`
                @in @interpolate(flat) vTextureId: u32;
    
                ${ue(y())}
            `,main:`
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);
    
                ${le(y())}
            `}}),m[r]};const U={};function se(r){const o=[];for(let e=0;e<r;e++)e>0&&o.push("else"),e<r-1&&o.push(`if(vTextureId < ${e}.5)`),o.push("{"),o.push(`	outColor = texture(uTextures[${e}], vUV);`),o.push("}");return o.join(`
`)}L=function(r){return U[r]||(U[r]={name:"texture-batch-bit",vertex:{header:`
                in vec2 aTextureIdAndRound;
                out float vTextureId;
              
            `,main:`
                vTextureId = aTextureIdAndRound.y;
            `,end:`
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `},fragment:{header:`
                in float vTextureId;
    
                uniform sampler2D uTextures[${r}];
              
            `,main:`
    
                ${se(y())}
            `}}),U[r]},F={name:"round-pixels-bit",vertex:{header:`
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32> 
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},B={name:"round-pixels-bit",vertex:{header:`   
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {       
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `}},f={name:"local-uniform-bit",vertex:{header:`

            struct LocalUniforms {
                uTransformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
                uRound:f32,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `,main:`
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `,end:`
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `}},Y={...f,vertex:{...f.vertex,header:f.vertex.header.replace("group(1)","group(2)")}},X={name:"local-uniform-bit",vertex:{header:`

            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `,main:`
            vColor *= uColor;
            modelMatrix = uTransformMatrix;
        `,end:`
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `}},z=class{constructor(){this.vertexSize=4,this.indexSize=6,this.location=0,this.batcher=null,this.batch=null,this.roundPixels=0}get blendMode(){return this.renderable.groupBlendMode}packAttributes(r,o,e,t){const a=this.renderable,l=this.texture,n=a.groupTransform,i=n.a,u=n.b,v=n.c,x=n.d,d=n.tx,p=n.ty,h=this.bounds,g=h.maxX,b=h.minX,C=h.maxY,P=h.minY,s=l.uvs,T=a.groupColorAlpha,$=t<<16|this.roundPixels&65535;r[e+0]=i*b+v*P+d,r[e+1]=x*P+u*b+p,r[e+2]=s.x0,r[e+3]=s.y0,o[e+4]=T,o[e+5]=$,r[e+6]=i*g+v*P+d,r[e+7]=x*P+u*g+p,r[e+8]=s.x1,r[e+9]=s.y1,o[e+10]=T,o[e+11]=$,r[e+12]=i*g+v*C+d,r[e+13]=x*C+u*g+p,r[e+14]=s.x2,r[e+15]=s.y2,o[e+16]=T,o[e+17]=$,r[e+18]=i*b+v*C+d,r[e+19]=x*C+u*b+p,r[e+20]=s.x3,r[e+21]=s.y3,o[e+22]=T,o[e+23]=$}packIndex(r,o,e){r[o]=e+0,r[o+1]=e+1,r[o+2]=e+2,r[o+3]=e+0,r[o+4]=e+2,r[o+5]=e+3}reset(){this.renderable=null,this.texture=null,this.batcher=null,this.batch=null,this.bounds=null}},G=function(r,o,e){const t=(r>>24&255)/255;o[e++]=(r&255)/255*t,o[e++]=(r>>8&255)/255*t,o[e++]=(r>>16&255)/255*t,o[e++]=t}});export{z as B,xe as __tla,W as a,f as b,D as c,G as d,O as e,k as f,E as g,L as h,B as i,X as j,Y as l,F as r};
