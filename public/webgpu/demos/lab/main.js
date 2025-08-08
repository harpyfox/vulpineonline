let currentAdapter;
let currentDevice;

const canvas = e("player-canvas");
let currentContext;
let currentCanvasFormat;

let currentShaderWGSL;
let currentShader;

let currentVertexData;
let currentVertexBuffer;

let currentPipeline;

const editorTextArea = e("editor-code");
const editorLog = e("editor-log");
const editorColor = editorTextArea.style.backgroundColor;

const buttonRender = e("button-render");

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
    console.log(`example`);

    editorTextArea.value = exampleWGSL;
    currentVertexData = exampleVertexData;
}

function e(id) {
    return document.getElementById(id);
}

function editor_error(msg) {
    editorTextArea.style.backgroundColor = "red";
    const p = document.createElement('p');
    p.innerText = msg;
    editorLog.appendChild(p);
}

function editor_ok() {
    editorTextArea.style.backgroundColor = "limegreen";
    const p = document.createElement('p');
    p.innerText = "OK!";
    editorLog.appendChild(p);
}

function editor_clear() {
    editorTextArea.style.backgroundColor = editorColor;
    editorLog.innerHTML = '';
}

async function init() {
    console.log(`init`);

    // get adapter and device
    currentAdapter = await navigator.gpu.requestAdapter();
    currentDevice = await currentAdapter.requestDevice();

    // configure canvas
    currentCanvasFormat = navigator.gpu.getPreferredCanvasFormat();
    currentContext = canvas.getContext("webgpu");
    currentContext.configure(
        {
            device: currentDevice,
            format: currentCanvasFormat,
            alphaMode: "premultiplied",
        }
    );

    e("button-example").addEventListener("click", example);
    e("button-compile").addEventListener("click", compile);
    buttonRender.addEventListener("click", render);

}

async function compile() {
    console.log(`compile`);

    buttonRender.toggleAttribute("disabled", true);
    await shader_changed(editorTextArea.value);
}

async function shader_changed(shaderWGSL) {
    console.log(`shader_changed ${shaderWGSL}`);

    if (shaderWGSL == '') {
        editor_error("no shader help");
        return;
    }

    currentShaderWGSL = shaderWGSL;
    currentShader = currentDevice.createShaderModule({
        label: "shader",
        code: currentShaderWGSL,
    });

    const shaderCompilationInfo = await currentShader.getCompilationInfo();
    if (shaderCompilationInfo.messages.length > 0) {
        for (const message of shaderCompilationInfo.messages) {
            let formattedMessage = '';
            if (message.lineNum) {
                formattedMessage += `Line ${message.lineNum}:${message.linePos} - ${currentShaderWGSL.substring(message.offset, message.length)}\n`
            }
            formattedMessage += message.message;

            editor_error(formattedMessage)

            switch (message.type) {
                case 'error':
                    console.error(formattedMessage); break;
                case 'warning':
                    console.warn(formattedMessage); break;
                default:
                    console.info(formattedMessage); break;
            }
        }

        return;
    } 

    // shader changed, update buffers
    if (!currentVertexData) currentVertexData = exampleVertexData;
    await vertex_changed(currentVertexData);
}

async function vertex_changed(vertexData) {
    console.log(`vertex_changed ${vertexData}`);

    currentVertexData = vertexData;
    currentVertexBuffer = currentDevice.createBuffer({
        label: "vertexBuffer",
        size: currentVertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    currentDevice.queue.writeBuffer(currentVertexBuffer, 0, currentVertexData);

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
                format: currentCanvasFormat,
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

    currentPipeline = currentDevice.createRenderPipeline({
        label: "pipeline",
        layout: "auto",
        vertex: vertexDesc,
        fragment: fragmentDesc,
        primitive: primitiveDesc,
    });

    if (!currentPipeline) {
        editor_error("pipelineee rror");
    } 
    else {
        buttonRender.toggleAttribute("disabled", false);
        editor_ok();
        render();
    }
}

function frame() {
    const commandEncoder = currentDevice.createCommandEncoder()
    const textureView = currentContext.getCurrentTexture().createView();

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
    currentDevice.queue.submit([commandBuffer]);
}

function render() {
    console.log(`render`);
    requestAnimationFrame(frame);
}

document.addEventListener("DOMContentLoaded", init);

// set the canvas rendering resolution to the element's size on the page
function updateCanvasResolution() {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    e("player-resolution").innerText = `${width} x ${height}`;
}
updateCanvasResolution();
new ResizeObserver(updateCanvasResolution).observe(canvas);

editorTextArea.addEventListener('input', editor_clear);
buttonRender.toggleAttribute("disabled", true);