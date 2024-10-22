struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>
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
  
@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition)
  );
}

struct MyUniforms {
    time:f32,
    screenSize:vec2<f32>,
    UVScale:vec2<f32>,
    power:f32,
    rate:f32,
    speed:f32,
    blockCount:f32,
    colorRate:f32
}
@group(1) @binding(0) var<uniform> my : MyUniforms;

fn my_trunc(x: f32) -> f32 {
	if (x < 0.0) {
        return -floor(-x); 
    } else {
        return floor(x); 
    };
} 

fn random(seed: f32) -> f32 {
	return fract(543.2543 * sin(dot(vec2<f32>(seed, seed), vec2<f32>(3525.46, -54.3415))));
} 

fn isnan(val: f32) -> bool {
	if (val < 0. || 0. < val || val == 0.) { return false; } else { return true; };
} 



@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {
    	var newpower: f32 = my.power;
	if (isnan(newpower)) {
		newpower = 0.03;
	}
	let enable_shift: f32 = f32(random(my_trunc(my.time * my.speed)) < my.rate);
	var fixed_uv: vec2<f32> = uv;
	fixed_uv.x = fixed_uv.x + ((random(my_trunc(uv.y * my.blockCount) / my.blockCount + my.time) - 0.5) * newpower * enable_shift);
	var pixel_color: vec4<f32> = textureSample(uTexture,uSampler, fixed_uv);
	pixel_color.r = mix(pixel_color.r, textureSample(uTexture,uSampler, fixed_uv + vec2<f32>(my.colorRate, 0.)).r, enable_shift);
	pixel_color.b = mix(pixel_color.b, textureSample(uTexture,uSampler, fixed_uv + vec2<f32>(-my.colorRate, 0.)).b, enable_shift);
    return pixel_color;
}