import{c as ve,d as de,n as z,w as he,G as pe,f as ge,g as y,__tla as be}from"./o.O.js";let O,W,D,f,G,H,k,E,L,K,B,F,X,Y,Pe=Promise.all([(()=>{try{return be}catch{}})()]).then(async()=>{let N=0;class q{constructor(t){this._poolKeyHash=Object.create(null),this._texturePool={},this.textureOptions=t||{},this.enableFullScreen=!1}createTexture(t,e,r){const a=new ve({...this.textureOptions,width:t,height:e,resolution:1,antialias:r,autoGarbageCollect:!0});return new de({source:a,label:`texturePool_${N++}`})}getOptimalTexture(t,e,r=1,a){let u=Math.ceil(t*r-1e-6),i=Math.ceil(e*r-1e-6);u=z(u),i=z(i);const s=(u<<17)+(i<<1)+(a?1:0);this._texturePool[s]||(this._texturePool[s]=[]);let n=this._texturePool[s].pop();return n||(n=this.createTexture(u,i,a)),n.source._resolution=r,n.source.width=u/r,n.source.height=i/r,n.source.pixelWidth=u,n.source.pixelHeight=i,n.frame.x=0,n.frame.y=0,n.frame.width=t,n.frame.height=e,n.updateUvs(),this._poolKeyHash[n.uid]=s,n}getSameSizeTexture(t,e=!1){const r=t.source;return this.getOptimalTexture(t.width,t.height,r._resolution,e)}returnTexture(t){const e=this._poolKeyHash[t.uid];this._texturePool[e].push(t)}clear(t){if(t=t!==!1,t)for(const e in this._texturePool){const r=this._texturePool[e];if(r)for(let a=0;a<r.length;a++)r[a].destroy(!0)}this._texturePool={}}}W=new q;function _(o,t,e){if(o)for(const r in o){const a=r.toLocaleLowerCase(),u=t[a];if(u){let i=o[r];r==="header"&&(i=i.replace(/@in\s+[^;]+;\s*/g,"").replace(/@out\s+[^;]+;\s*/g,"")),e&&u.push(`//----${e}----//`),u.push(i)}else he(`${r} placement hook does not exist in shader`)}}const J=/\{\{(.*?)\}\}/g;function S(o){var e;const t={};return(((e=o.match(J))==null?void 0:e.map(r=>r.replace(/[{()}]/g,"")))??[]).forEach(r=>{t[r]=[]}),t}function w(o,t){let e;const r=/@in\s+([^;]+);/g;for(;(e=r.exec(o))!==null;)t.push(e[1])}function V(o,t,e=!1){const r=[];w(t,r),o.forEach(s=>{s.header&&w(s.header,r)});const a=r;e&&a.sort();const u=a.map((s,n)=>`       @location(${n}) ${s},`).join(`
`);let i=t.replace(/@in\s+[^;]+;\s*/g,"");return i=i.replace("{{in}}",`
${u}
`),i}function j(o,t){let e;const r=/@out\s+([^;]+);/g;for(;(e=r.exec(o))!==null;)t.push(e[1])}function Q(o){const t=/\b(\w+)\s*:/g.exec(o);return t?t[1]:""}function Z(o){const t=/@.*?\s+/g;return o.replace(t,"")}function ee(o,t){const e=[];j(t,e),o.forEach(n=>{n.header&&j(n.header,e)});let r=0;const a=e.sort().map(n=>n.indexOf("builtin")>-1?n:`@location(${r++}) ${n}`).join(`,
`),u=e.sort().map(n=>`       var ${Z(n)};`).join(`
`),i=`return VSOutput(
                ${e.sort().map(n=>` ${Q(n)}`).join(`,
`)});`;let s=t.replace(/@out\s+[^;]+;\s*/g,"");return s=s.replace("{{struct}}",`
${a}
`),s=s.replace("{{start}}",`
${u}
`),s=s.replace("{{return}}",`
${i}
`),s}function I(o,t){let e=o;for(const r in t){const a=t[r];a.join(`
`).length?e=e.replace(`{{${r}}}`,`//-----${r} START-----//
${a.join(`
`)}
//----${r} FINISH----//`):e=e.replace(`{{${r}}}`,"")}return e}const c=Object.create(null),M=new Map;let te=0;function oe({template:o,bits:t}){const e=R(o,t);if(c[e])return c[e];const{vertex:r,fragment:a}=ne(o,t);return c[e]=A(r,a,t),c[e]}function re({template:o,bits:t}){const e=R(o,t);return c[e]||(c[e]=A(o.vertex,o.fragment,t)),c[e]}function ne(o,t){const e=t.map(i=>i.vertex).filter(i=>!!i),r=t.map(i=>i.fragment).filter(i=>!!i);let a=V(e,o.vertex,!0);a=ee(e,a);const u=V(r,o.fragment,!0);return{vertex:a,fragment:u}}function R(o,t){return t.map(e=>(M.has(e)||M.set(e,te++),M.get(e))).sort((e,r)=>e-r).join("-")+o.vertex+o.fragment}function A(o,t,e){const r=S(o),a=S(t);return e.forEach(u=>{_(u.vertex,r,u.name),_(u.fragment,a,u.name)}),{vertex:I(o,r),fragment:I(t,a)}}const ie=`
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
`,ae=`
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
`,ue=`
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
`,se=`
   
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
`,le={name:"global-uniforms-bit",vertex:{header:`
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `}},ce={name:"global-uniforms-bit",vertex:{header:`
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `}};G=function({bits:o,name:t}){const e=oe({template:{fragment:ae,vertex:ie},bits:[le,...o]});return pe.from({name:t,vertex:{source:e.vertex,entryPoint:"main"},fragment:{source:e.fragment,entryPoint:"main"}})},k=function({bits:o,name:t}){return new ge({name:t,...re({template:{vertex:ue,fragment:se},bits:[ce,...o]})})};let m;D={name:"color-bit",vertex:{header:`
            @in aColor: vec4<f32>;
        `,main:`
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `}},E={name:"color-bit",vertex:{header:`
            in vec4 aColor;
        `,main:`
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `}},m={};function fe(o){const t=[];if(o===1)t.push("@group(1) @binding(0) var textureSource1: texture_2d<f32>;"),t.push("@group(1) @binding(1) var textureSampler1: sampler;");else{let e=0;for(let r=0;r<o;r++)t.push(`@group(1) @binding(${e++}) var textureSource${r+1}: texture_2d<f32>;`),t.push(`@group(1) @binding(${e++}) var textureSampler${r+1}: sampler;`)}return t.join(`
`)}function me(o){const t=[];if(o===1)t.push("outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);");else{t.push("switch vTextureId {");for(let e=0;e<o;e++)e===o-1?t.push("  default:{"):t.push(`  case ${e}:{`),t.push(`      outColor = textureSampleGrad(textureSource${e+1}, textureSampler${e+1}, vUV, uvDx, uvDy);`),t.push("      break;}");t.push("}")}return t.join(`
`)}L=function(o){return m[o]||(m[o]={name:"texture-batch-bit",vertex:{header:`
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
    
                ${fe(y())}
            `,main:`
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);
    
                ${me(y())}
            `}}),m[o]};const U={};function xe(o){const t=[];for(let e=0;e<o;e++)e>0&&t.push("else"),e<o-1&&t.push(`if(vTextureId < ${e}.5)`),t.push("{"),t.push(`	outColor = texture(uTextures[${e}], vUV);`),t.push("}");return t.join(`
`)}K=function(o){return U[o]||(U[o]={name:"texture-batch-bit",vertex:{header:`
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
    
                uniform sampler2D uTextures[${o}];
              
            `,main:`
    
                ${xe(y())}
            `}}),U[o]},Y={name:"round-pixels-bit",vertex:{header:`
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
        `}},X={...f,vertex:{...f.vertex,header:f.vertex.header.replace("group(1)","group(2)")}},F={name:"local-uniform-bit",vertex:{header:`

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
        `}},O=class{constructor(){this.vertexSize=4,this.indexSize=6,this.location=0,this.batcher=null,this.batch=null,this.roundPixels=0}get blendMode(){return this.renderable.groupBlendMode}packAttributes(o,t,e,r){const a=this.renderable,u=this.texture,i=a.groupTransform,s=i.a,n=i.b,x=i.c,v=i.d,d=i.tx,h=i.ty,p=this.bounds,g=p.maxX,b=p.minX,P=p.maxY,C=p.minY,l=u.uvs,T=a.groupColorAlpha,$=r<<16|this.roundPixels&65535;o[e+0]=s*b+x*C+d,o[e+1]=v*C+n*b+h,o[e+2]=l.x0,o[e+3]=l.y0,t[e+4]=T,t[e+5]=$,o[e+6]=s*g+x*C+d,o[e+7]=v*C+n*g+h,o[e+8]=l.x1,o[e+9]=l.y1,t[e+10]=T,t[e+11]=$,o[e+12]=s*g+x*P+d,o[e+13]=v*P+n*g+h,o[e+14]=l.x2,o[e+15]=l.y2,t[e+16]=T,t[e+17]=$,o[e+18]=s*b+x*P+d,o[e+19]=v*P+n*b+h,o[e+20]=l.x3,o[e+21]=l.y3,t[e+22]=T,t[e+23]=$}packIndex(o,t,e){o[t]=e+0,o[t+1]=e+1,o[t+2]=e+2,o[t+3]=e+0,o[t+4]=e+2,o[t+5]=e+3}reset(){this.renderable=null,this.texture=null,this.batcher=null,this.batch=null,this.bounds=null}},H=function(o,t,e){const r=(o>>24&255)/255;t[e++]=(o&255)/255*r,t[e++]=(o>>8&255)/255*r,t[e++]=(o>>16&255)/255*r,t[e++]=r}});export{O as B,W as T,Pe as __tla,D as a,f as b,G as c,H as d,k as e,E as f,L as g,K as h,B as i,F as j,X as l,Y as r};
