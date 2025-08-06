import { add_message } from "../../util.js";

const shaderWGSL = `
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
    // OUT.rgb = baseColor;
    // OUT.a = IN.color.a;

    return OUT;
}`

if (!navigator.gpu) {
    let err = "webGPU is not supported on your browser. shit probably wont work";
    console.error(err);
}

async function main() {
    const canvas2d = document.getElementById("overlay");

    const ctx2d = canvas2d.getContext("2d", {
        alpha: true,

    });

    add_message(ctx2d, "2. canvas webgpu");

    // get adapter and device
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter) {
        add_message(ctx2d, `adapter: ${adapter.info.vendor} ${adapter.info.architecture} OK`, "limegreen");
    } else {
        add_message(ctx2d, "adapter: fail", "red");
        return;
    }

    const device = await adapter.requestDevice();
    if (device) {
        add_message(ctx2d, `device: OK`, "limegreen");
    } else {
        add_message(ctx2d, "device: fail", "red");
        return;
    }

    // compile shader    
    const shaderModule = device.createShaderModule({
        label: "shaderWGSL",
        code: shaderWGSL,
    });

    const shaderInfo = await shaderModule.getCompilationInfo();
    if (shaderInfo.messages.length > 0) {
        add_message(ctx2d, `shader: ${shaderInfo.messages[0].message}`, "red");
    } else {
        add_message(ctx2d, `shader: ${shaderModule.label} OK`, "limegreen");
    }

    // configure canvas
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    const canvasgpu = document.getElementById("render");
    const ctxgpu = canvasgpu.getContext("webgpu");
    ctxgpu.configure(
        {
            device: device,
            format: presentationFormat,
            alphaMode: "premultiplied",
        }
    )
    add_message(ctx2d, `canvas: ${presentationFormat} OK`, "limegreen");

    add_message(ctx2d, " this doesnt do anything yet sorry");
    add_message(ctx2d, "b ut i did compile a shader with your gpu");
    add_message(ctx2d, " all part of my plan ", "pink");


    function render() {

    }
}

document.addEventListener("DOMContentLoaded", main);