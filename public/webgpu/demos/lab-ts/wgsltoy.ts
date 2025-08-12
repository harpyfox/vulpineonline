let device: GPUDevice;
export let context: GPUCanvasContext | null;
let targetFormat: GPUTextureFormat;

export let currentShaderWGSL: string;
let currentShader: GPUShaderModule;
let currentVertexData: GPUAllowSharedBufferSource;
let currentVertexBuffer: GPUBuffer;
let currentPipeline: GPURenderPipeline;

export async function init(targetCanvas: HTMLCanvasElement) {
    const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();
    if (adapter) {
        device = await adapter?.requestDevice();
    }
    if (!device) {
        return { success: false, message: "webgpu is not supported on this browser." };
    }

    context = targetCanvas.getContext("webgpu");
    targetFormat = navigator.gpu.getPreferredCanvasFormat();
    context?.configure(
        {
            device: device,
            format: targetFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
            alphaMode: "premultiplied",
        }
    );

    return { success: true, message: "initialised" };
}

export async function setShader(shaderWGSL: string) {

    // compile shader
    if (shaderWGSL == '') {
        return { success: false, message: "no shader help" };
    }

    const compileStartTime: number = Date.now();
    currentShaderWGSL = shaderWGSL;
    currentShader = device.createShaderModule({
        label: `wgsltoy-shader`,
        code: currentShaderWGSL,
    });
    const compileEndTime: number = Date.now();
    const compileTime: number = compileEndTime - compileStartTime;

    const shaderCompilationInfo: GPUCompilationInfo = await currentShader.getCompilationInfo();
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
    const vertexBufferLayout: GPUVertexBufferLayout = {
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
    }

    // fragment target
    const fragmentTarget: GPUColorTargetState = {
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
    }

    // hit it
    currentPipeline = device.createRenderPipeline({
        label: `wgsltoy-pipeline`,
        layout: "auto",
        vertex: { // vertex shader entrypoint
            module: currentShader,
            buffers: [vertexBufferLayout],
            constants: {},
        },
        fragment: { // fragment shader entrypoint
            module: currentShader,
            targets: [fragmentTarget],
            constants: {},
        },
        primitive: { // triangle format
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

    // RENDER TARGET: COLOR
    const colorTexture: GPUTexture = context.getCurrentTexture();

    const color: GPURenderPassColorAttachment = {
        view: colorTexture,
        clearValue: [0, 0, 0, 0],
        loadOp: "clear",
        storeOp: "store",
    }

    // RENDER TARGET: DEPTH
    const depthStencilTexture: GPUTexture = device.createTexture({
        size: [context.canvas.width, context.canvas.height, 1],
        format: "depth24plus-stencil8",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    });

    const depthStencil: GPURenderPassDepthStencilAttachment = {
        view: depthStencilTexture,
        depthClearValue: 0,
        depthLoadOp: "load",
        depthStoreOp: "store",
        stencilClearValue: 1,
        stencilLoadOp: "load",
        stencilStoreOp: "store",
    }

    // render pass
    const passDesc: GPURenderPassDescriptor = {
        label: `wgsltoy-pass`,
        colorAttachments: [ color, ],
        depthStencilAttachment: depthStencil,
    };

    // draw!
    const encoder: GPUCommandEncoder = device.createCommandEncoder({ label: `wgsltoy-encoder` })
    const pass: GPURenderPassEncoder = encoder.beginRenderPass(passDesc);
    pass.setPipeline(currentPipeline);
    pass.setVertexBuffer(0, currentVertexBuffer);
    pass.draw(3);
    pass.end();
    device.queue.submit([encoder.finish()]);
}