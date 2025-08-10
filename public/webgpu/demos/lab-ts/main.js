import { e, fetchShader } from "../../util.js";
import * as wgsltoy from "./wgsltoy.js";

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

async function example() {
    e("editor-code").value = await fetchShader("red");
    editor_clear();
}

async function init() {
    editor_info("initialising...");

    const result = await wgsltoy.init(e("player-canvas"));
    if (result.success) {
        editor_info(result.message);
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
        const width = wgsltoy.context.canvas.offsetWidth;
        const height = wgsltoy.context.canvas.offsetHeight;
        wgsltoy.context.canvas.width = width;
        wgsltoy.context.canvas.height = height;
        e("player-resolution").innerText = `${width} x ${height}`;
    }
    updateCanvasResolution();
    new ResizeObserver(updateCanvasResolution).observe(wgsltoy.context.canvas);
}

async function compile() {
    if (!wgsltoy.context) return;

    e("button-compile").toggleAttribute("disabled", true);
    e("editor-code").toggleAttribute("readonly", true);
    editor_clear();

    const result = await wgsltoy.setShader(e("editor-code").value);
    if (result.success) {
        editor_ok(result.message);
        render();
    } 
    else {
        editor_error(result.message);
    }

    e("button-compile").toggleAttribute("disabled", false);
    e("editor-code").toggleAttribute("readonly", false);
}

function render() {
    requestAnimationFrame(wgsltoy.frame);
}

document.addEventListener("DOMContentLoaded", init);