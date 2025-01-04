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
    power:f32
}

@group(1) @binding(0) var<uniform> my : MyUniforms;

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {
	let p: vec2<f32> = vec2<f32>(uv.x, uv.y * my.screenSize.y / my.screenSize.x);
	let aspect: f32 = my.screenSize.x / my.screenSize.y;
	var m: vec2<f32> = vec2<f32>(0.5, 0.5 / aspect);
	let d: vec2<f32> = p - m;
	let r: f32 = sqrt(dot(d, d));
    var new_power: f32 = 2. * 3.141592 / (2. * sqrt(dot(m, m))) * my.power;
    var bind: f32 = 0.0;
    if (new_power > 0.) { 
        bind = sqrt(dot(m, m)); 
    } else { 
        if (aspect < 1.) {
            bind = m.x; 
        } else {
            bind = m.y; 
        }; 
    };
	var nuv: vec2<f32>;
	if (new_power > 0.) {
		nuv = m + normalize(d) * tan(r * new_power) * bind / tan(bind * new_power);
	} else { 
		nuv = m + normalize(d) * atan(r * -new_power * 10.) * bind / atan(-new_power * bind * 10.);
	}
	return textureSample(uTexture, uSampler, vec2<f32>(nuv.x, nuv.y * aspect));
}