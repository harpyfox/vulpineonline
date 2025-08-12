struct v2f {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
}

@binding(0) @group(0) var<uniform> frame: u32;

@vertex
fn vert(
    @builtin(vertex_index) vertexIndex: u32
) -> v2f {
    var OUT: v2f;

    let pos = array(
        vec2f(0.0, 0.6),
        vec2f(-0.5,-0.6),
        vec2f(0.5, -0.6)
    );

    let col = array(
        vec3f(1.0, 0.0, 0.0),
        vec3f(0.0, 1.0, 0.0),
        vec3f(0.0, 0.0, 1.0)
    );

    OUT.position = vec4f(pos[vertexIndex], 0.0, 1.0);
    OUT.color = vec4f(col[vertexIndex], 1.0);
    return OUT;
}

@fragment
fn frag(
    IN: v2f
) -> @location(0) vec4f { // corresponds to fragment target array
    return IN.color;
}