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
    size:f32
}
@group(1) @binding(0) var<uniform> my : MyUniforms;

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {
	var c: vec4<f32> = textureSample(uTexture, uSampler, uv);
	var length: f32 = dot(c, c);
	let pixel_size: vec2<f32> = 1. / my.screenSize;
	for (var x: f32 = -my.size; x < my.size; x = x + 1) {
		for (var y: f32 = -my.size; y < my.size;  y = y + 1) {
			if (x * x + y * y > my.size * my.size) {
                continue;
            }
			let new_c: vec4<f32> = textureSample(uTexture, uSampler, uv + pixel_size * vec2<f32>(x, y));
			let new_length: f32 = dot(new_c, new_c);
			if (new_length > length) {
				length = new_length;
				c = new_c;
			}
		}

	}
    return c;
}