import { e, fetchShader } from "../../utils.js";
import * as wgsltoy from "./wgsltoy.js";
import * as editor from "./editor.js";

async function example(exampleKey) {
    const shaderWGSL = await fetchShader(exampleKey);
    editor.setContent(shaderWGSL)
    editor.log.clear();
    await compile();
}

async function init() {

    // init editor
    editor.create(e("monacotest"), e("editor-log"));
    editor.log.info("initialised editor");


    // init renderer
    const result = await wgsltoy.create(e("player-canvas"));
    if (result.success) {
        editor.log.ok(result.message);
    } 
    else {
        editor.log.error(result.message);
        return;
    }

    function updateCanvasResolution() {
        const width = wgsltoy.context.canvas.offsetWidth;
        const height = wgsltoy.context.canvas.offsetHeight;
        wgsltoy.context.canvas.width = width;
        wgsltoy.context.canvas.height = height;
        e("player-resolution").innerText = `${width} x ${height}`;
    }
    updateCanvasResolution();
    new ResizeObserver(updateCanvasResolution).observe(wgsltoy.context.canvas);


    // init events
    e("editor-code").addEventListener('input', editor_clear);
    e("button-compile").addEventListener("click", compile);

    let exampleButtons = document.querySelectorAll(".button-example");
    for (const button of exampleButtons) {
        const exampleKey = button.innerText;

        button.title = `Replace content of the shader editor with '${exampleKey}.wgsl'.`;
        button.addEventListener("click", () => example(exampleKey));
    }   
}

async function compile() {
    if (!wgsltoy.context) return;

    e("button-compile").toggleAttribute("disabled", true);
    e("editor-code").toggleAttribute("readonly", true);
    editor.log.clear();

    const editorContent = editor.getContent();
    const result = await wgsltoy.setShader(editorContent);
    if (result.success) {
        editor.log.ok(result.message);
        render();
    } 
    else {
        editor.log.error(result.message);
    }

    e("button-compile").toggleAttribute("disabled", false);
    e("editor-code").toggleAttribute("readonly", false);
}

function render() {
    requestAnimationFrame(wgsltoy.frame);
}

document.addEventListener("DOMContentLoaded", init);