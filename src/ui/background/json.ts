import { genNoise } from "./utils"
async function convertImageBitmapToBase64(imageBitmap: ImageBitmap): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(imageBitmap, 0, 0);
    return canvas.toDataURL('image/png');
 }
const nosic = await convertImageBitmapToBase64(await genNoise(256,256))
export const json = [
    {
        "ver": "0.1",
        "info": {
            "id": "lstSRS",
            "date": "1460054893",
            "viewed": 40084,
            "name": "Gargantua With HDR Bloom",
            "username": "sonicether",
            "description": "My attempt at recreating the black hole Gargantua from the movie Interstellar. High-quality bloom was essential for the right look, so I did what I could with only four passes. No background stars/nebulae, maybe I'll do that in the future.",
            "likes": 485,
            "published": 3,
            "flags": 32,
            "usePreview": 0,
            "tags": [
                "raymarching",
                "bloom",
                "blackhole",
                "hdr",
                "gargantua"
            ],
            "hasliked": 0,
            "parentid": "",
            "parentname": ""
        },
        "renderpass": [
            {
                "inputs": [
                    {
                        "id": "4dXGR8",
                        "filepath": "/media/previz/buffer00.png",
                        "previewfilepath": "/media/previz/buffer00.png",
                        "type": "buffer",
                        "channel": 0,
                        "sampler": {
                            "filter": "linear",
                            "wrap": "clamp",
                            "vflip": "true",
                            "srgb": "false",
                            "internal": "byte"
                        },
                        "published": 1
                    },
                    {
                        "id": "XsXGR8",
                        "filepath": "/media/previz/buffer01.png",
                        "previewfilepath": "/media/previz/buffer01.png",
                        "type": "buffer",
                        "channel": 1,
                        "sampler": {
                            "filter": "linear",
                            "wrap": "clamp",
                            "vflip": "true",
                            "srgb": "false",
                            "internal": "byte"
                        },
                        "published": 1
                    },
                    {
                        "id": "4sXGR8",
                        "filepath": "/media/previz/buffer02.png",
                        "previewfilepath": "/media/previz/buffer02.png",
                        "type": "buffer",
                        "channel": 2,
                        "sampler": {
                            "filter": "linear",
                            "wrap": "clamp",
                            "vflip": "true",
                            "srgb": "false",
                            "internal": "byte"
                        },
                        "published": 1
                    },
                    {
                        "id": "XdfGR8",
                        "filepath": "/media/previz/buffer03.png",
                        "previewfilepath": "/media/previz/buffer03.png",
                        "type": "buffer",
                        "channel": 3,
                        "sampler": {
                            "filter": "linear",
                            "wrap": "clamp",
                            "vflip": "true",
                            "srgb": "false",
                            "internal": "byte"
                        },
                        "published": 1
                    }
                ],
                "outputs": [
                    {
                        "id": "4dfGRr",
                        "channel": 0
                    }
                ],
                "code": "vec3 saturate(vec3 x)\n{\n    return clamp(x, vec3(0.0), vec3(1.0));\n}\n\nvec4 cubic(float x)\n{\n    float x2 = x * x;\n    float x3 = x2 * x;\n    vec4 w;\n    w.x =   -x3 + 3.0*x2 - 3.0*x + 1.0;\n    w.y =  3.0*x3 - 6.0*x2       + 4.0;\n    w.z = -3.0*x3 + 3.0*x2 + 3.0*x + 1.0;\n    w.w =  x3;\n    return w / 6.0;\n}\n\nvec4 BicubicTexture(in sampler2D tex, in vec2 coord)\n{\n\tvec2 resolution = iResolution.xy;\n\n\tcoord *= resolution;\n\n\tfloat fx = fract(coord.x);\n    float fy = fract(coord.y);\n    coord.x -= fx;\n    coord.y -= fy;\n\n    fx -= 0.5;\n    fy -= 0.5;\n\n    vec4 xcubic = cubic(fx);\n    vec4 ycubic = cubic(fy);\n\n    vec4 c = vec4(coord.x - 0.5, coord.x + 1.5, coord.y - 0.5, coord.y + 1.5);\n    vec4 s = vec4(xcubic.x + xcubic.y, xcubic.z + xcubic.w, ycubic.x + ycubic.y, ycubic.z + ycubic.w);\n    vec4 offset = c + vec4(xcubic.y, xcubic.w, ycubic.y, ycubic.w) / s;\n\n    vec4 sample0 = texture(tex, vec2(offset.x, offset.z) / resolution);\n    vec4 sample1 = texture(tex, vec2(offset.y, offset.z) / resolution);\n    vec4 sample2 = texture(tex, vec2(offset.x, offset.w) / resolution);\n    vec4 sample3 = texture(tex, vec2(offset.y, offset.w) / resolution);\n\n    float sx = s.x / (s.x + s.y);\n    float sy = s.z / (s.z + s.w);\n\n    return mix( mix(sample3, sample2, sx), mix(sample1, sample0, sx), sy);\n}\n\nvec3 ColorFetch(vec2 coord)\n{\n \treturn texture(iChannel0, coord).rgb;   \n}\n\nvec3 BloomFetch(vec2 coord)\n{\n \treturn BicubicTexture(iChannel3, coord).rgb;   \n}\n\nvec3 Grab(vec2 coord, const float octave, const vec2 offset)\n{\n \tfloat scale = exp2(octave);\n    \n    coord /= scale;\n    coord -= offset;\n\n    return BloomFetch(coord);\n}\n\nvec2 CalcOffset(float octave)\n{\n    vec2 offset = vec2(0.0);\n    \n    vec2 padding = vec2(10.0) / iResolution.xy;\n    \n    offset.x = -min(1.0, floor(octave / 3.0)) * (0.25 + padding.x);\n    \n    offset.y = -(1.0 - (1.0 / exp2(octave))) - padding.y * octave;\n\n\toffset.y += min(1.0, floor(octave / 3.0)) * 0.35;\n    \n \treturn offset;   \n}\n\nvec3 GetBloom(vec2 coord)\n{\n \tvec3 bloom = vec3(0.0);\n    \n    //Reconstruct bloom from multiple blurred images\n    bloom += Grab(coord, 1.0, vec2(CalcOffset(0.0))) * 1.0;\n    bloom += Grab(coord, 2.0, vec2(CalcOffset(1.0))) * 1.5;\n\tbloom += Grab(coord, 3.0, vec2(CalcOffset(2.0))) * 1.0;\n    bloom += Grab(coord, 4.0, vec2(CalcOffset(3.0))) * 1.5;\n    bloom += Grab(coord, 5.0, vec2(CalcOffset(4.0))) * 1.8;\n    bloom += Grab(coord, 6.0, vec2(CalcOffset(5.0))) * 1.0;\n    bloom += Grab(coord, 7.0, vec2(CalcOffset(6.0))) * 1.0;\n    bloom += Grab(coord, 8.0, vec2(CalcOffset(7.0))) * 1.0;\n\n\treturn bloom;\n}\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n    \n    vec2 uv = fragCoord.xy / iResolution.xy;\n    \n    vec3 color = ColorFetch(uv);\n    \n    \n    color += GetBloom(uv) * 0.08;\n    \n    color *= 200.0;\n    \n\n    //Tonemapping and color grading\n    color = pow(color, vec3(1.5));\n    color = color / (1.0 + color);\n    color = pow(color, vec3(1.0 / 1.5));\n\n    \n    color = mix(color, color * color * (3.0 - 2.0 * color), vec3(1.0));\n    color = pow(color, vec3(1.3, 1.20, 1.0));    \n\n\tcolor = saturate(color * 1.01);\n    \n    color = pow(color, vec3(0.7 / 2.2));\n\n    fragColor = vec4(color, 1.0);\n\n}\n",
                "name": "Image",
                "description": "",
                "type": "image"
            },
            {
                "inputs": [
                    {
                        "id": "XsXGRn",
                        "filepath": "/assets/background/iChannel0.jpg",
                        "previewfilepath": "/assets/background/iChannel0.jpg",
                        "type": "texture",
                        "channel": 1,
                        "sampler": {
                            "filter": "mipmap",
                            "wrap": "repeat",
                            "vflip": "true",
                            "srgb": "false",
                            "internal": "byte"
                        },
                        "published": 1
                    },
                    {
                        "id": "Xsf3zn",
                        "filepath": nosic,
                        "previewfilepath": nosic,
                        "type": "texture",
                        "channel": 0,
                        "sampler": {
                            "filter": "mipmap",
                            "wrap": "repeat",
                            "vflip": "true",
                            "srgb": "false",
                            "internal": "byte"
                        },
                        "published": 1
                    },
                    {
                        "id": "4dXGR8",
                        "filepath": "/media/previz/buffer00.png",
                        "previewfilepath": "/media/previz/buffer00.png",
                        "type": "buffer",
                        "channel": 2,
                        "sampler": {
                            "filter": "linear",
                            "wrap": "clamp",
                            "vflip": "true",
                            "srgb": "false",
                            "internal": "byte"
                        },
                        "published": 1
                    }
                ],
                "outputs": [
                    {
                        "id": "4dXGR8",
                        "channel": 0
                    }
                ],
                "code": "/*  \nMain render. \n\nTemporal AA for a smooth image. Temporal accumulation is disabled while moving the view to prevent ghosting.\n*/\n\n#define ITERATIONS 81         //Increase for less grainy result\n#define TEMPORAL_AA\n\n\nconst vec3 MainColor = vec3(1.0);\n\n//noise code by iq\nfloat noise( in vec3 x )\n{\n    vec3 p = floor(x);\n    vec3 f = fract(x);\n    f = f*f*(3.0-2.0*f);\n    vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;\n    vec2 rg = textureLod( iChannel0, (uv+ 0.5)/256.0, 0.0 ).yx;\n    return -1.0+2.0*mix( rg.x, rg.y, f.z );\n}\n\nfloat saturate(float x)\n{\n    return clamp(x, 0.0, 1.0);\n}\n\nvec3 saturate(vec3 x)\n{\n    return clamp(x, vec3(0.0), vec3(1.0));\n}\n\nfloat rand(vec2 coord)\n{\n    return saturate(fract(sin(dot(coord, vec2(12.9898, 78.223))) * 43758.5453));\n}\n\nfloat pcurve( float x, float a, float b )\n{\n    float k = pow(a+b,a+b) / (pow(a,a)*pow(b,b));\n    return k * pow( x, a ) * pow( 1.0-x, b );\n}\n\nconst float pi = 3.14159265;\n\nfloat atan2(float y, float x)\n{\n    if (x > 0.0)\n    {\n        return atan(y / x);\n    }\n    else if (x == 0.0)\n    {\n        if (y > 0.0)\n        {\n            return pi / 2.0;\n        }\n        else if (y < 0.0)\n        {\n            return -(pi / 2.0);\n        }\n        else\n        {\n            return 0.0;\n        }\n    }\n    else //(x < 0.0)\n    {\n        if (y >= 0.0)\n        {\n            return atan(y / x) + pi;\n        }\n        else\n        {\n            return atan(y / x) - pi;\n        }\n    }\n}\n\nfloat sdTorus(vec3 p, vec2 t)\n{\n    vec2 q = vec2(length(p.xz) - t.x, p.y);\n    return length(q)-t.y;\n}\n\nfloat sdSphere(vec3 p, float r)\n{\n  return length(p)-r;\n}\n\nvoid Haze(inout vec3 color, vec3 pos, float alpha)\n{\n    vec2 t = vec2(1.0, 0.01);\n\n    float torusDist = length(sdTorus(pos + vec3(0.0, -0.05, 0.0), t));\n\n    float bloomDisc = 1.0 / (pow(torusDist, 2.0) + 0.001);\n    vec3 col = MainColor;\n    bloomDisc *= length(pos) < 0.5 ? 0.0 : 1.0;\n\n    color += col * bloomDisc * (2.9 / float(ITERATIONS)) * (1.0 - alpha * 1.0);\n}\n\nvoid GasDisc(inout vec3 color, inout float alpha, vec3 pos)\n{\n    float discRadius = 3.2;\n    float discWidth = 5.3;\n    float discInner = discRadius - discWidth * 0.5;\n    float discOuter = discRadius + discWidth * 0.5;\n    \n    vec3 origin = vec3(0.0, 0.0, 0.0);\n    float mouseZ = iMouse.y / iResolution.y;\n    vec3 discNormal = normalize(vec3(0.0, 1.0, 0.0));\n    float discThickness = 0.1;\n\n    float distFromCenter = distance(pos, origin);\n    float distFromDisc = dot(discNormal, pos - origin);\n    \n    float radialGradient = 1.0 - saturate((distFromCenter - discInner) / discWidth * 0.5);\n\n    float coverage = pcurve(radialGradient, 4.0, 0.9);\n\n    discThickness *= radialGradient;\n    coverage *= saturate(1.0 - abs(distFromDisc) / discThickness);\n\n    vec3 dustColorLit = MainColor;\n    vec3 dustColorDark = vec3(0.0, 0.0, 0.0);\n\n    float dustGlow = 1.0 / (pow(1.0 - radialGradient, 2.0) * 290.0 + 0.002);\n    vec3 dustColor = dustColorLit * dustGlow * 8.2;\n\n    coverage = saturate(coverage * 0.7);\n\n\n    float fade = pow((abs(distFromCenter - discInner) + 0.4), 4.0) * 0.04;\n    float bloomFactor = 1.0 / (pow(distFromDisc, 2.0) * 40.0 + fade + 0.00002);\n    vec3 b = dustColorLit * pow(bloomFactor, 1.5);\n    \n    b *= mix(vec3(1.7, 1.1, 1.0), vec3(0.5, 0.6, 1.0), vec3(pow(radialGradient, 2.0)));\n    b *= mix(vec3(1.7, 0.5, 0.1), vec3(1.0), vec3(pow(radialGradient, 0.5)));\n\n    dustColor = mix(dustColor, b * 150.0, saturate(1.0 - coverage * 1.0));\n    coverage = saturate(coverage + bloomFactor * bloomFactor * 0.1);\n    \n    if (coverage < 0.01)\n    {\n        return;   \n    }\n    \n    \n    vec3 radialCoords;\n    radialCoords.x = distFromCenter * 1.5 + 0.55;\n    radialCoords.y = atan2(-pos.x, -pos.z) * 1.5;\n    radialCoords.z = distFromDisc * 1.5;\n\n    radialCoords *= 0.95;\n    \n    float speed = 0.06;\n    \n    float noise1 = 1.0;\n    vec3 rc = radialCoords + 0.0;               rc.y += iTime * speed;\n    noise1 *= noise(rc * 3.0) * 0.5 + 0.5;      rc.y -= iTime * speed;\n    noise1 *= noise(rc * 6.0) * 0.5 + 0.5;      rc.y += iTime * speed;\n    noise1 *= noise(rc * 12.0) * 0.5 + 0.5;     rc.y -= iTime * speed;\n    noise1 *= noise(rc * 24.0) * 0.5 + 0.5;     rc.y += iTime * speed;\n\n    float noise2 = 2.0;\n    rc = radialCoords + 30.0;\n    noise2 *= noise(rc * 3.0) * 0.5 + 0.5;      rc.y += iTime * speed;\n    noise2 *= noise(rc * 6.0) * 0.5 + 0.5;      rc.y -= iTime * speed;\n    noise2 *= noise(rc * 12.0) * 0.5 + 0.5;     rc.y += iTime * speed;\n    noise2 *= noise(rc * 24.0) * 0.5 + 0.5;     rc.y -= iTime * speed;\n    noise2 *= noise(rc * 48.0) * 0.5 + 0.5;     rc.y += iTime * speed;\n    noise2 *= noise(rc * 92.0) * 0.5 + 0.5;     rc.y -= iTime * speed;\n\n    dustColor *= noise1 * 0.998 + 0.002;\n    coverage *= noise2;\n    \n    radialCoords.y += iTime * speed * 0.5;\n    \n    dustColor *= pow(texture(iChannel1, radialCoords.yx * vec2(0.15, 0.27)).rgb, vec3(2.0)) * 4.0;\n\n    coverage = saturate(coverage * 1200.0 / float(ITERATIONS));\n    dustColor = max(vec3(0.0), dustColor);\n\n    coverage *= pcurve(radialGradient, 4.0, 0.9);\n\n    color = (1.0 - alpha) * dustColor * coverage + color;\n\n    alpha = (1.0 - alpha) * coverage + alpha;\n}\n\n\n\nvec3 rotate(vec3 p, float x, float y, float z)\n{\n    mat3 matx = mat3(1.0, 0.0, 0.0,\n                     0.0, cos(x), sin(x),\n                     0.0, -sin(x), cos(x));\n\n    mat3 maty = mat3(cos(y), 0.0, -sin(y),\n                     0.0, 1.0, 0.0,\n                     sin(y), 0.0, cos(y));\n\n    mat3 matz = mat3(cos(z), sin(z), 0.0,\n                     -sin(z), cos(z), 0.0,\n                     0.0, 0.0, 1.0);\n\n    p = matx * p;\n    p = matz * p;\n    p = maty * p;\n\n    return p;\n}\n\nvoid RotateCamera(inout vec3 eyevec, inout vec3 eyepos)\n{\n    float mousePosY = iMouse.y / iResolution.y;\n    float mousePosX = iMouse.x / iResolution.x;\n\n    vec3 angle = vec3(mousePosY * 0.05 + 0.05, 1.0 + mousePosX * 1.0, -0.45);\n\n    eyevec = rotate(eyevec, angle.x, angle.y, angle.z);\n    eyepos = rotate(eyepos, angle.x, angle.y, angle.z);\n}\n\nvoid WarpSpace(inout vec3 eyevec, inout vec3 raypos)\n{\n    vec3 origin = vec3(0.0, 0.0, 0.0);\n\n    float singularityDist = distance(raypos, origin);\n    float warpFactor = 1.0 / (pow(singularityDist, 2.0) + 0.000001);\n\n    vec3 singularityVector = normalize(origin - raypos);\n    \n    float warpAmount = 5.0;\n\n    eyevec = normalize(eyevec + singularityVector * warpFactor * warpAmount / float(ITERATIONS));\n}\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n    \n    vec2 uv = fragCoord.xy / iResolution.xy;\n    \n    float aspect = iResolution.x / iResolution.y;\n\n    vec2 uveye = uv;\n    \n    #ifdef TEMPORAL_AA\n    uveye.x += (rand(uv + sin(iTime * 1.0)) / iResolution.x) * (iMouse.z > 1.0 ? 0.0 : 1.0);\n    uveye.y += (rand(uv + 1.0 + sin(iTime * 1.0)) / iResolution.y) * (iMouse.z > 1.0 ? 0.0 : 1.0);\n    #endif\n    \n    vec3 eyevec = normalize(vec3((uveye * 2.0 - 1.0) * vec2(aspect, 1.0), 6.0));\n    vec3 eyepos = vec3(0.0, -0.0, -10.0);\n    \n    vec2 mousepos = iMouse.xy / iResolution.xy;\n    if (mousepos.x == 0.0)\n    {\n        mousepos.x = 0.35;\n    }\n    eyepos.x += mousepos.x * 3.0 - 1.5;\n    \n    const float far = 15.0;\n\n    RotateCamera(eyevec, eyepos);\n\n    vec3 color = vec3(0.0, 0.0, 0.0);\n    \n    float dither = rand(uv \n                        #ifdef TEMPORAL_AA\n                        + sin(iTime * 1.0) * (iMouse.z > 1.0 ? 0.0 : 1.0)\n                        #endif\n                       ) * 2.0;\n\n\n    float alpha = 0.0;\n    vec3 raypos = eyepos + eyevec * dither * far / float(ITERATIONS);\n    for (int i = 0; i < ITERATIONS; i++)\n    {        \n        WarpSpace(eyevec, raypos);\n        raypos += eyevec * far / float(ITERATIONS);\n        GasDisc(color, alpha, raypos);\n        Haze(color, raypos, alpha);\n    }\n    \n    color *= 0.0001;\n\n    \n    #ifdef TEMPORAL_AA\n    const float p = 1.0;\n    vec3 previous = pow(texture(iChannel2, uv).rgb, vec3(1.0 / p));\n    \n    color = pow(color, vec3(1.0 / p));\n    \n    float blendWeight = 0.9 * (iMouse.z > 1.0 ? 0.0 : 1.0);\n    \n    color = mix(color, previous, blendWeight);\n    \n    color = pow(color, vec3(p));\n    #endif\n    \n    fragColor = vec4(saturate(color), 1.0);\n\n}",
                "name": "Buf A",
                "description": "",
                "type": "buffer"
            },
            {
                "inputs": [
                    {
                        "id": "4dXGR8",
                        "filepath": "/media/previz/buffer00.png",
                        "previewfilepath": "/media/previz/buffer00.png",
                        "type": "buffer",
                        "channel": 0,
                        "sampler": {
                            "filter": "linear",
                            "wrap": "clamp",
                            "vflip": "true",
                            "srgb": "false",
                            "internal": "byte"
                        },
                        "published": 1
                    }
                ],
                "outputs": [
                    {
                        "id": "XsXGR8",
                        "channel": 0
                    }
                ],
                "code": "//First bloom pass, mipmap tree thing\n\nvec3 ColorFetch(vec2 coord)\n{\n \treturn texture(iChannel0, coord).rgb;   \n}\n\nvec3 Grab1(vec2 coord, const float octave, const vec2 offset)\n{\n \tfloat scale = exp2(octave);\n    \n    coord += offset;\n    coord *= scale;\n\n   \tif (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0)\n    {\n     \treturn vec3(0.0);   \n    }\n    \n    vec3 color = ColorFetch(coord);\n\n    return color;\n}\n\nvec3 Grab4(vec2 coord, const float octave, const vec2 offset)\n{\n \tfloat scale = exp2(octave);\n    \n    coord += offset;\n    coord *= scale;\n\n   \tif (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0)\n    {\n     \treturn vec3(0.0);   \n    }\n    \n    vec3 color = vec3(0.0);\n    float weights = 0.0;\n    \n    const int oversampling = 4;\n    \n    for (int i = 0; i < oversampling; i++)\n    {    \t    \n        for (int j = 0; j < oversampling; j++)\n        {\n\t\t\tvec2 off = (vec2(i, j) / iResolution.xy + vec2(0.0) / iResolution.xy) * scale / float(oversampling);\n            color += ColorFetch(coord + off);\n            \n\n            weights += 1.0;\n        }\n    }\n    \n    color /= weights;\n    \n    return color;\n}\n\nvec3 Grab8(vec2 coord, const float octave, const vec2 offset)\n{\n \tfloat scale = exp2(octave);\n    \n    coord += offset;\n    coord *= scale;\n\n   \tif (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0)\n    {\n     \treturn vec3(0.0);   \n    }\n    \n    vec3 color = vec3(0.0);\n    float weights = 0.0;\n    \n    const int oversampling = 8;\n    \n    for (int i = 0; i < oversampling; i++)\n    {    \t    \n        for (int j = 0; j < oversampling; j++)\n        {\n\t\t\tvec2 off = (vec2(i, j) / iResolution.xy + vec2(0.0) / iResolution.xy) * scale / float(oversampling);\n            color += ColorFetch(coord + off);\n            \n\n            weights += 1.0;\n        }\n    }\n    \n    color /= weights;\n    \n    return color;\n}\n\nvec3 Grab16(vec2 coord, const float octave, const vec2 offset)\n{\n \tfloat scale = exp2(octave);\n    \n    coord += offset;\n    coord *= scale;\n\n   \tif (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0)\n    {\n     \treturn vec3(0.0);   \n    }\n    \n    vec3 color = vec3(0.0);\n    float weights = 0.0;\n    \n    const int oversampling = 16;\n    \n    for (int i = 0; i < oversampling; i++)\n    {    \t    \n        for (int j = 0; j < oversampling; j++)\n        {\n\t\t\tvec2 off = (vec2(i, j) / iResolution.xy + vec2(0.0) / iResolution.xy) * scale / float(oversampling);\n            color += ColorFetch(coord + off);\n            \n\n            weights += 1.0;\n        }\n    }\n    \n    color /= weights;\n    \n    return color;\n}\n\nvec2 CalcOffset(float octave)\n{\n    vec2 offset = vec2(0.0);\n    \n    vec2 padding = vec2(10.0) / iResolution.xy;\n    \n    offset.x = -min(1.0, floor(octave / 3.0)) * (0.25 + padding.x);\n    \n    offset.y = -(1.0 - (1.0 / exp2(octave))) - padding.y * octave;\n\n\toffset.y += min(1.0, floor(octave / 3.0)) * 0.35;\n    \n \treturn offset;   \n}\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n    vec2 uv = fragCoord.xy / iResolution.xy;\n    \n    \n    vec3 color = vec3(0.0);\n    \n    /*\n    Create a mipmap tree thingy with padding to prevent leaking bloom\n   \t\n\tSince there's no mipmaps for the previous buffer and the reduction process has to be done in one pass,\n    oversampling is required for a proper result\n\t*/\n    color += Grab1(uv, 1.0, vec2(0.0,  0.0)   );\n    color += Grab4(uv, 2.0, vec2(CalcOffset(1.0))   );\n    color += Grab8(uv, 3.0, vec2(CalcOffset(2.0))   );\n    color += Grab16(uv, 4.0, vec2(CalcOffset(3.0))   );\n    color += Grab16(uv, 5.0, vec2(CalcOffset(4.0))   );\n    color += Grab16(uv, 6.0, vec2(CalcOffset(5.0))   );\n    color += Grab16(uv, 7.0, vec2(CalcOffset(6.0))   );\n    color += Grab16(uv, 8.0, vec2(CalcOffset(7.0))   );\n\n\n    fragColor = vec4(color, 1.0);\n}",
                "name": "Buf B",
                "description": "",
                "type": "buffer"
            },
            {
                "inputs": [
                    {
                        "id": "XsXGR8",
                        "filepath": "/media/previz/buffer01.png",
                        "previewfilepath": "/media/previz/buffer01.png",
                        "type": "buffer",
                        "channel": 0,
                        "sampler": {
                            "filter": "linear",
                            "wrap": "clamp",
                            "vflip": "true",
                            "srgb": "false",
                            "internal": "byte"
                        },
                        "published": 1
                    }
                ],
                "outputs": [
                    {
                        "id": "4sXGR8",
                        "channel": 0
                    }
                ],
                "code": "//Horizontal gaussian blur leveraging hardware filtering for fewer texture lookups.\n\nvec3 ColorFetch(vec2 coord)\n{\n \treturn texture(iChannel0, coord).rgb;   \n}\n\nfloat weights[5];\nfloat offsets[5];\n\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord )\n{    \n    \n    weights[0] = 0.19638062;\n    weights[1] = 0.29675293;\n    weights[2] = 0.09442139;\n    weights[3] = 0.01037598;\n    weights[4] = 0.00025940;\n    \n    offsets[0] = 0.00000000;\n    offsets[1] = 1.41176471;\n    offsets[2] = 3.29411765;\n    offsets[3] = 5.17647059;\n    offsets[4] = 7.05882353;\n    \n    vec2 uv = fragCoord.xy / iResolution.xy;\n    \n    vec3 color = vec3(0.0);\n    float weightSum = 0.0;\n    \n    if (uv.x < 0.52)\n    {\n        color += ColorFetch(uv) * weights[0];\n        weightSum += weights[0];\n\n        for(int i = 1; i < 5; i++)\n        {\n            vec2 offset = vec2(offsets[i]) / iResolution.xy;\n            color += ColorFetch(uv + offset * vec2(0.5, 0.0)) * weights[i];\n            color += ColorFetch(uv - offset * vec2(0.5, 0.0)) * weights[i];\n            weightSum += weights[i] * 2.0;\n        }\n\n        color /= weightSum;\n    }\n\n    fragColor = vec4(color,1.0);\n}",
                "name": "Buf C",
                "description": "",
                "type": "buffer"
            },
            {
                "inputs": [
                    {
                        "id": "4sXGR8",
                        "filepath": "/media/previz/buffer02.png",
                        "previewfilepath": "/media/previz/buffer02.png",
                        "type": "buffer",
                        "channel": 0,
                        "sampler": {
                            "filter": "linear",
                            "wrap": "clamp",
                            "vflip": "true",
                            "srgb": "false",
                            "internal": "byte"
                        },
                        "published": 1
                    }
                ],
                "outputs": [
                    {
                        "id": "XdfGR8",
                        "channel": 0
                    }
                ],
                "code": "//Vertical gaussian blur leveraging hardware filtering for fewer texture lookups.\n\nvec3 ColorFetch(vec2 coord)\n{\n \treturn texture(iChannel0, coord).rgb;   \n}\n\nfloat weights[5];\nfloat offsets[5];\n\n\nvoid mainImage( out vec4 fragColor, in vec2 fragCoord )\n{    \n    \n    weights[0] = 0.19638062;\n    weights[1] = 0.29675293;\n    weights[2] = 0.09442139;\n    weights[3] = 0.01037598;\n    weights[4] = 0.00025940;\n    \n    offsets[0] = 0.00000000;\n    offsets[1] = 1.41176471;\n    offsets[2] = 3.29411765;\n    offsets[3] = 5.17647059;\n    offsets[4] = 7.05882353;\n    \n    vec2 uv = fragCoord.xy / iResolution.xy;\n    \n    vec3 color = vec3(0.0);\n    float weightSum = 0.0;\n    \n    if (uv.x < 0.52)\n    {\n        color += ColorFetch(uv) * weights[0];\n        weightSum += weights[0];\n\n        for(int i = 1; i < 5; i++)\n        {\n            vec2 offset = vec2(offsets[i]) / iResolution.xy;\n            color += ColorFetch(uv + offset * vec2(0.0, 0.5)) * weights[i];\n            color += ColorFetch(uv - offset * vec2(0.0, 0.5)) * weights[i];\n            weightSum += weights[i] * 2.0;\n        }\n\n        color /= weightSum;\n    }\n\n    fragColor = vec4(color,1.0);\n}",
                "name": "Buf D",
                "description": "",
                "type": "buffer"
            }
        ]
    }
]
