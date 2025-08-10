let device;
export let context;
let targetFormat;
export let currentShaderWGSL;
let currentShader;
let currentVertexData;
let currentVertexBuffer;
let currentPipeline;
export async function init(targetCanvas) {
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter) {
        device = await adapter?.requestDevice();
    }
    if (!device) {
        return { success: false, message: "webgpu is not supported on this browser." };
    }
    context = targetCanvas.getContext("webgpu");
    targetFormat = navigator.gpu.getPreferredCanvasFormat();
    context?.configure({
        device: device,
        format: targetFormat,
        alphaMode: "premultiplied",
    });
    return { success: true, message: "initialised" };
}
export async function setShader(shaderWGSL) {
    // compile shader
    if (shaderWGSL == '') {
        return { success: false, message: "no shader help" };
    }
    const compileStartTime = Date.now();
    currentShaderWGSL = shaderWGSL;
    currentShader = device.createShaderModule({
        label: "shader",
        code: currentShaderWGSL,
    });
    const compileEndTime = Date.now();
    const compileTime = compileEndTime - compileStartTime;
    const shaderCompilationInfo = await currentShader.getCompilationInfo();
    if (shaderCompilationInfo.messages.length > 0) {
        return { success: false, message: shaderCompilationInfo.messages[0]?.message };
    }
    // vertex buffers
    currentVertexData = new Float32Array([
        0.0, 0.6, 0, 1, 1, 0, 0, 1,
        -0.5, -0.6, 0, 1, 0, 1, 0, 1,
        0.5, -0.6, 0, 1, 0, 0, 1, 1,
    ]);
    currentVertexBuffer = device.createBuffer({
        label: "vertexBuffer",
        size: currentVertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(currentVertexBuffer, 0, currentVertexData);
    // vertex buffer
    // mirrors vertex shader input parameters
    const vertexBufferLayout = {
        arrayStride: 32, // 32 bytes per vertex
        stepMode: "vertex", // default
        attributes: [
            {
                shaderLocation: 0, // location(0) position
                offset: 0, // first 16 bytes
                format: "float32x4",
            },
            {
                shaderLocation: 1, // location(1) color
                offset: 16, // second 16 bytes
                format: "float32x4",
            },
        ],
    };
    // fragment target
    const fragmentTarget = {
        format: targetFormat,
        blend: {
            color: {
                srcFactor: "one",
                dstFactor: "zero",
                operation: "add",
            },
            alpha: {
                srcFactor: "one",
                dstFactor: "zero",
                operation: "add",
            },
        }
    };
    // hit it
    currentPipeline = device.createRenderPipeline({
        label: "pipeline",
        layout: "auto",
        vertex: {
            module: currentShader,
            entryPoint: "vert", // defaults to function with @vertex attribute
            buffers: [vertexBufferLayout],
            constants: {},
        },
        fragment: {
            module: currentShader,
            entryPoint: "frag", // defaults to function with @fragment attribute
            targets: [fragmentTarget],
            constants: {},
        },
        primitive: {
            topology: "triangle-list", // default
            cullMode: "back",
        },
    });
    if (!currentPipeline) {
        return { success: false, message: "pipeline error" };
    }
    else {
        return { success: true, message: `compiled in ${compileTime}ms!` };
    }
}
export function frame() {
    if (!context) {
        return { success: false, message: "fuck" };
    }
    const commandEncoder = device.createCommandEncoder();
    // render pass
    const pass = {
        colorAttachments: [
            {
                view: context.getCurrentTexture().createView(),
                clearValue: [0, 0, 0, 0],
                loadOp: "clear",
                storeOp: "store",
            },
        ],
    };
    // draw!
    // @ts-expect-error i dont CARE
    pass.colorAttachments[0].view = context.getCurrentTexture().createView();
    const passEncoder = commandEncoder.beginRenderPass(pass);
    passEncoder.setPipeline(currentPipeline);
    passEncoder.setVertexBuffer(0, currentVertexBuffer);
    passEncoder.draw(3);
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);
}
