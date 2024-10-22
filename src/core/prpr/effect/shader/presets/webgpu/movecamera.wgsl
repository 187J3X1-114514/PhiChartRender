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
    iX:f32,
    iY:f32,
    iAngle:f32,
    iZoom:f32,
    iOutsideColor:vec4<f32>
}
@group(1) @binding(0) var<uniform> my : MyUniforms;

fn rotateMat(angle: f32) -> mat2x2<f32> {
	let rad: f32 = radians(angle);
	return mat2x2<f32>(cos(rad), -sin(rad), sin(rad), cos(rad));
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {
    var _uv: vec2<f32> = uv;
	var toCenter: vec2<f32> = _uv - vec2<f32>(0.5);
	toCenter = toCenter * (my.iZoom);
	_uv = vec2<f32>(0.5) + toCenter;
	let rot: mat2x2<f32> = rotateMat(my.iAngle);
	_uv = _uv * my.screenSize * rot / my.screenSize;
	let _move: vec2<f32> = vec2<f32>(my.iX, my.iY) - vec2<f32>(0.5);
	_uv = _uv + (_move);
    var _temp = _uv != clamp(_uv, vec2<f32>(0.0), vec2<f32>(1.0));
    let dx = dpdx(_uv);
    let dy = dpdx(_uv);
	if (_temp.x & _temp.y) {
		return my.iOutsideColor;
	}
    return textureSampleGrad(uTexture, uSampler, _uv, dx, dy);
}