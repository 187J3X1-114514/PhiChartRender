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
    sampleCount:f32,
    power:f32
}
@group(1) @binding(0) var<uniform> my : MyUniforms;

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {
	var sum: vec3<f32>;
	var color: vec3<f32> = vec3<f32>(0.);
	let offset: vec2<f32> = (uv - vec2<f32>(0.5)) * vec2<f32>(1., -1.);
	let sample_count: i32 = i32(my.sampleCount);
	let spread: f32 = my.power;
	for (var i: i32 = 0; i < 64; i = i + 1) {
		if (i >= sample_count) {
			break;
		}
		let t = 2.0 * f32(i) / f32(sample_count - 1);
		var slice: vec3<f32> = vec3<f32>(1. - t, 1. - abs(t - 1.), t - 1.);
		slice = max(slice, vec3<f32>(0.0));
		sum = sum + (slice);
		let slice_offset: vec2<f32> = (t - 1.) * spread * offset;
		color = color + (slice * textureSample(uTexture,uSampler, uv + slice_offset).rgb);
	}
	color = color / (sum);
    return vec4<f32>(color, 1.0);
}