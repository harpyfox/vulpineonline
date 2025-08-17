//#region Variables
let device;
let context;
let targetFormat;
let currentShaderWGSL;
let currentShader;
let currentVertexData;
let currentVertexBuffer;
let currentPipeline;
//#endregion
//#region Functions
async function create(domCanvasElement) {
    console.group("wgsltoy.create()");
    console.time("wgsltoy.create()");
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter) {
        device = await adapter?.requestDevice();
    }
    if (!device) {
        console.timeEnd("wgsltoy.create()");
        console.groupEnd();
        return { success: false, message: "webgpu is not supported on this browser." };
    }
    context = domCanvasElement.getContext("webgpu");
    targetFormat = navigator.gpu.getPreferredCanvasFormat();
    context?.configure({
        device: device,
        format: targetFormat,
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        alphaMode: "premultiplied",
    });
    console.timeEnd("wgsltoy.create()");
    console.groupEnd();
    return { success: true, message: "initialised" };
}
async function setShader(shaderWGSL) {
    // compile shader
    if (shaderWGSL == '') {
        return { success: false, message: "no shader help" };
    }
    const compileStartTime = Date.now();
    currentShaderWGSL = shaderWGSL;
    currentShader = device.createShaderModule({
        label: `wgsltoy-shader`,
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
        label: `wgsltoy-vertexbuffer`,
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
        label: `wgsltoy-pipeline`,
        layout: "auto",
        vertex: {
            module: currentShader,
            buffers: [vertexBufferLayout],
            constants: {},
        },
        fragment: {
            module: currentShader,
            targets: [fragmentTarget],
            constants: {},
        },
        depthStencil: {
            format: "depth24plus-stencil8",
            depthCompare: "always",
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
function frame() {
    if (!context) {
        return { success: false, message: "fuck" };
    }
    // RENDER TARGET: COLOR
    const colorTexture = context.getCurrentTexture();
    const color = {
        view: colorTexture.createView(),
        clearValue: [0, 0, 0, 0],
        loadOp: "clear",
        storeOp: "store",
    };
    // RENDER TARGET: DEPTH
    const depthStencilTexture = device.createTexture({
        size: [context.canvas.width, context.canvas.height, 1],
        format: "depth24plus-stencil8",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    });
    const depthStencil = {
        view: depthStencilTexture.createView(),
        depthClearValue: 0,
        depthLoadOp: "load",
        depthStoreOp: "store",
        stencilClearValue: 1,
        stencilLoadOp: "load",
        stencilStoreOp: "store",
    };
    // render pass
    const passDesc = {
        label: `wgsltoy-pass`,
        colorAttachments: [color,],
        depthStencilAttachment: depthStencil,
    };
    // draw!
    const encoder = device.createCommandEncoder({ label: `wgsltoy-encoder` });
    const pass = encoder.beginRenderPass(passDesc);
    pass.setPipeline(currentPipeline);
    pass.setVertexBuffer(0, currentVertexBuffer);
    pass.draw(3);
    pass.end();
    device.queue.submit([encoder.finish()]);
}
//#endregion
//#region Export
export { create, setShader, frame, context, currentShaderWGSL };
//#endregion
