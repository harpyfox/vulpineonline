import { e, fetchShader } from "../../utils.js";
import * as renderer from "./wgsltoy.js";
import * as editor from "./editor.js";

async function example(exampleKey) {
    const shaderWGSL = await fetchShader(exampleKey);
    editor.setContent(shaderWGSL)
    editor.log.clear();
    await compile();
}

async function init() {
    console.group("init()");
    console.time("init()");

    
    console.info("init editor...");
    await editor.create(e("editor-code"), e("editor-log"));
    editor.log.info("editor OK!");


    console.info("init renderer...");
    await renderer.create(e("player-canvas"));

    function updateCanvasResolution() {
        const width = renderer.context.canvas.offsetWidth;
        const height = renderer.context.canvas.offsetHeight;
        renderer.context.canvas.width = width;
        renderer.context.canvas.height = height;
        e("player-resolution").innerText = `${width} x ${height}`;
    }
    updateCanvasResolution();
    new ResizeObserver(updateCanvasResolution).observe(renderer.context.canvas);
    console.info("renderer OK!");


    console.info("init sideeffects...")
    e("editor-code").addEventListener('input', editor.log.clear);
    e("button-compile").addEventListener("click", compile);

    let exampleButtons = document.querySelectorAll(".button-example");
    for (const button of exampleButtons) {
        const exampleKey = button.innerText;

        button.title = `Replace content of the shader editor with '${exampleKey}.wgsl'.`;
        button.addEventListener("click", () => example(exampleKey));
    }
    console.info("sideeffects OK!");


    console.timeEnd("init()");
    console.groupEnd();
    console.info("yippee!!!!!!!!!!!");
}

async function compile() {
    if (!renderer.context) return;

    e("button-compile").toggleAttribute("disabled", true);
    e("editor-code").toggleAttribute("readonly", true);
    editor.log.clear();

    const editorContent = editor.getContent();
    const result = await renderer.setShader(editorContent);
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
    requestAnimationFrame(renderer.frame);
}

document.addEventListener("DOMContentLoaded", init);