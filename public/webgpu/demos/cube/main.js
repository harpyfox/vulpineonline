import * as wgsltoy from "./wgsltoy.js";

function e(id) {
    return document.getElementById(id);
}

//#region Example


const exampleVertexData = new Float32Array([
    0.0, 0.6, 0, 1, 1, 0, 0, 1, 
    -0.5, -0.6, 0, 1, 0, 1, 0, 1, 
    0.5, -0.6, 0, 1, 0, 0, 1, 1,
]);

const exampleWGSL = 
`struct v2f {
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
}`;

function example() {
    e("editor-code").value = exampleWGSL;
    editor_clear();
}

//#endregion

//#region Editor Log

function editor_error(msg) {
    e("editor-log").style.backgroundColor = "red";
    const p = document.createElement('p');
    p.innerText = msg;
    e("editor-log").appendChild(p);
}

function editor_ok(msg) {
    e("editor-log").style.backgroundColor = "limegreen";
    const p = document.createElement('p');
    p.innerText = msg;
    e("editor-log").appendChild(p);
}

function editor_info(msg) {
    e("editor-log").style.backgroundColor = "black";
    const p = document.createElement('p');
    p.innerText = msg;
    e("editor-log").appendChild(p);
}

function editor_clear() {
    e("editor-log").style.backgroundColor = "black";
}

//#endregion

async function init() {
    editor_info("initialising...");
    e("button-compile").toggleAttribute("disabled", true);

    const result = await wgsltoy.init(e("player-canvas"));
    if (result.success) {
        editor_info(result.message);
        e("button-compile").toggleAttribute("disabled", false);
    } 
    else {
        editor_error(result.message);
        return;
    }

    e("editor-code").addEventListener('input', editor_clear);
    e("button-example").addEventListener("click", example);
    e("button-compile").addEventListener("click", compile);

    // set the canvas rendering resolution to the element's size on the page
    function updateCanvasResolution() {
        const width = wgsltoy.canvas.offsetWidth;
        const height = wgsltoy.canvas.offsetHeight;
        wgsltoy.canvas.width = width;
        wgsltoy.canvas.height = height;
        e("player-resolution").innerText = `${width} x ${height}`;
    }
    updateCanvasResolution();
    new ResizeObserver(updateCanvasResolution).observe(wgsltoy.canvas);
}

async function compile() {

    e("button-compile").toggleAttribute("disabled", true);
    editor_clear();

    const result = await wgsltoy.setShader(e("editor-code").value);
    if (result.success) {
        e("button-compile").toggleAttribute("disabled", false);
        editor_ok(result.message);
        render();
    } 
    else {
        editor_error(result.message);
    }
}

function render() {
    requestAnimationFrame(wgsltoy.frame);
}

document.addEventListener("DOMContentLoaded", init);