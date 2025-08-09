let device: GPUDevice | undefined;
export let canvas: HTMLCanvasElement | undefined;
let context: GPUCanvasContext;
let targetFormat: GPUTextureFormat;

export let currentShaderWGSL: string;
let currentShader: GPUShaderModule;

let currentVertexData: Float32Array;
let currentVertexBuffer: GPUBuffer;

let currentPipeline: GPUPipelineBase;

function e(id: string) {
    return document.getElementById(id);
}
 
export async function init(targetCanvas: HTMLCanvasElement) {
    const adapter = await navigator.gpu?.requestAdapter();
    device = await adapter?.requestDevice();
    if (!device) {
        return { success: false, message: "webgpu is not supported on this browser." };
    }

    canvas = targetCanvas;
    if (canvas.getContext("webgpu") as GPUCanvasContext context)
    context = canvas.getContext("webgpu");
    targetFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure(
        {
            device: device,
            format: targetFormat,
            alphaMode: "premultiplied",
        }
    );

    return { success: true, message: "initialised" };
}

export async function setShader(shaderWGSL) {

    if (shaderWGSL == '') {
        return { success: false, message: "no shader help" };
    }

    currentShaderWGSL = shaderWGSL;
    currentShader = device.createShaderModule({
        label: "shader",
        code: currentShaderWGSL,
    });

    const shaderCompilationInfo = await currentShader.getCompilationInfo();
    if (shaderCompilationInfo.messages.length > 0) {
        return { success: false, message: shaderCompilationInfo.messages[0] };
    }

    // vertex buffers
    if (!currentVertexData) currentVertexData = exampleVertexData;

    currentVertexData = vertexData;
    currentVertexBuffer = device.createBuffer({
        label: "vertexBuffer",
        size: currentVertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(currentVertexBuffer, 0, currentVertexData);

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
        module: currentShader,
        entryPoint: "vert", // defaults to function with @vertex attribute
        buffers: vertexBuffers,
        constants: {},
    };

    const fragmentDesc = {
        module: currentShader,
        entryPoint: "frag", // defaults to function with @fragment attribute
        targets: [
            {
                format: targetFormat,
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

    currentPipeline = device.createRenderPipeline({
        label: "pipeline",
        layout: "auto",
        vertex: vertexDesc,
        fragment: fragmentDesc,
        primitive: primitiveDesc,
    });

    if (!currentPipeline) {
        return { success: false, message: "pipeline error" };
    } 
    else {
        return { success: true, message: "OK!" };
    }
}

export function frame() {
    const commandEncoder = device.createCommandEncoder()
    const textureView = context.getCurrentTexture().createView();

    // render pass
    const passDesc = {
        colorAttachments: [
            {
                view: textureView,
                clearValue: [0, 0, 0, 0],
                loadOp: "clear",
                storeOp: "store",
            },
        ],
    };

    const passEncoder = commandEncoder.beginRenderPass(passDesc);

    // draw!
    passEncoder.setPipeline(currentPipeline);
    passEncoder.setVertexBuffer(0, currentVertexBuffer);
    passEncoder.draw(3); // 3 vertices
    passEncoder.end();

    // send to gpu
    const commandBuffer = commandEncoder.finish();
    device.queue.submit([commandBuffer]);
}




