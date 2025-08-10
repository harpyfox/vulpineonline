struct v2f {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
}
    
@vertex
fn vert(
    @location(0) position: vec4f,
    @location(1) color: vec4f
) -> v2f
{
    var OUT: v2f;
    OUT.position = position;
    OUT.color = color;
    return OUT;
}
    
@fragment
fn frag(
    IN: v2f
) -> @location(0) vec4f
{
    var OUT = vec4f(0.0, 0.0, 0.0, 1.0);
    let baseColor = vec3f(IN.color.rgb);
    OUT = vec4f(baseColor, IN.color.a);
    return OUT;     
}