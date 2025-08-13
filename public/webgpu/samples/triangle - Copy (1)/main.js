import { add_message } from "../../utils.js";

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

const vertexData = new Float32Array([
    0.9, 0.9, 0, 1, 1, 0, 0, 1, 
    -0.9, -0.9, 0, 1, 0, 1, 0, 1, 
    0.9, -0.9, 0, 1, 0, 0, 1, 1,
]);

async function main() {
    const canvas2d = document.getElementById("overlay");
    const ctx2d = canvas2d.getContext("2d", {
        alpha: true,
    });

    add_message(ctx2d, "triangle - Copy (1)", "white");

    if (!navigator.gpu) {
        add_message(ctx2d, "webGPU not supported...", "red");
        return;
    }

    // get adapter and device
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter) {
        add_message(ctx2d, `adapter ${adapter.info.vendor} ${adapter.info.architecture} OK`, "limegreen");
    } else {
        add_message(ctx2d, "adapter not found :(", "red");
        return;
    }

    const device = await adapter.requestDevice();
    if (device) {
        add_message(ctx2d, `device OK`, "limegreen");
    } else {
        add_message(ctx2d, "device not found :(", "red");
        return;
    }

    device.addEventListener('uncapturederror', (event) => 
        {
            add_message(ctx2d, event.error.message, "red");
        }
    );

    // compile shader    
    const shader = device.createShaderModule({
        label: "shaderWGSL",
        code: shaderWGSL,
    });

    const shaderCompilationInfo = await shader.getCompilationInfo();
    if (shaderCompilationInfo.messages.length > 0) {
        for (const message of shaderCompilationInfo.messages) {
            let formattedMessage = '';
            if (message.lineNum) {
                formattedMessage += `Line ${message.lineNum}:${message.linePos} - ${shaderWGSL.substring(message.offset, message.length)}\n`
            }
            formattedMessage += message.message;

            switch (message.type) {
                case 'error':
                    add_message(ctx2d, formattedMessage, "red"); break;
                case 'warning':
                    add_message(ctx2d, formattedMessage, "yellow"); break; 
                default:
                    add_message(ctx2d, formattedMessage); break;
            }
        }
    } 
    else {
        add_message(ctx2d, `compiled ${shader.label} OK`, "limegreen");
    }

    // configure canvas
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    const canvasgpu = document.getElementById("render");
    const ctxgpu = canvasgpu.getContext("webgpu");
    ctxgpu.configure(
        {
            device: device,
            format: canvasFormat,
            alphaMode: "premultiplied",
        }
    );
    add_message(ctx2d, `canvas ${canvasFormat} OK`, "limegreen");

    // create vertex buffer
    const vertexBuffer = device.createBuffer({
        label: "vertexBuffer",
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    // writeBuffer(buffer, bufferOffset, data, dataOffset?, size?)
    device.queue.writeBuffer(vertexBuffer, 0, vertexData);

    // vertex layout
    // mirrors vertex shader input parameters!
    const vertexBuffers = [
        {
            arrayStride: 32, // 32 bytes per vertex
            stepMode: "vertex", // default
            attributes: [
                {
                    shaderLocation: 0, // location(0) position
                    offset: 0, // first 16 bytes for position
                    format: "float32x4",
                },
                {
                    shaderLocation: 1, // location(1) color
                    offset: 16, // second 16 bytes for color
                    format: "float32x4",
                },
            ],
        },
    ];

    // render pipeline
    const vertexDesc = {
        module: shader,
        entryPoint: "vert", // defaults to function with @vertex attribute
        buffers: vertexBuffers,
        constants: {},
    };

    const fragmentDesc = {
        module: shader,
        entryPoint: "frag", // defaults to function with @fragment attribute
        targets: [
            {
                format: canvasFormat,
                blend: {
                    color: {
                        srcFactor: "one", // all default
                        dstFactor: "zero",
                        operation: "add",
                    },
                    alpha: {
                        srcFactor: "one",
                        dstFactor: "zero",
                        operation: "add",
                    },
                }
            },
        ],
        constants: {},
    }

    const primitiveDesc = {
        topology: "triangle-list", // default
        cullMode: "none", // default for some reason
    }

    const pipeline = device.createRenderPipeline({
        label: "Demo2Pipeline",
        layout: "auto",
        vertex: vertexDesc,
        fragment: fragmentDesc,
        primitive: primitiveDesc,
    });

    add_message(ctx2d, `pipeline OK`, "limegreen");

    // render pass
    const passDesc = {
        colorAttachments: [
            {
                clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 }, // black
                loadOp: "clear",
                storeOp: "store",
                view: ctxgpu.getCurrentTexture().createView(), // canvas texture target
            },
        ],
    };

    const commandEncoder = device.createCommandEncoder()
    const passEncoder = commandEncoder.beginRenderPass(passDesc);

    // draw!
    passEncoder.setPipeline(pipeline);
    passEncoder.setVertexBuffer(0, vertexBuffer);
    passEncoder.draw(3); // 3 vertices
    passEncoder.end();

    // send to gpu
    const commandBuffer = commandEncoder.finish();
    device.queue.submit([commandBuffer]);


    function render() {

    }
}

document.addEventListener("DOMContentLoaded", main);