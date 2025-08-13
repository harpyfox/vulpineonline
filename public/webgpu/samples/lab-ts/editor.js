import * as monaco from 'monaco-editor';
// import * as monaco from '../../../../node_modules/monaco-editor/esm/vs/editor/editor.api';
// import * as monaco from '../../../../node_modules/monaco-editor/esm/vs/editor/';
//#region Variables
let currentEditor;
let log;
//#endregion
//#region Functions
function create(domElement, logElement) {
    currentEditor = monaco.editor.create(domElement, {
        value: `created from editor.ts!`,
        language: `typescript`
    });
    log = new Logger(logElement);
}
function setLanguage(language) {
    // [TODO]
    log.info(`setLanguage() not implemented yet. ${language}`);
}
function getContent() {
    // [TODO]
    return "getContent() not implemented yet.";
}
function setContent(code) {
    // [TODO]
    log.info(`setContent() not implemented yet. ${code}`);
}
class Logger {
    element;
    constructor(domElement) {
        this.element = domElement;
    }
    info(...data) {
        this.element.style.backgroundColor = "black";
        this.element.appendChild(this.#createEntry(data));
    }
    ok(...data) {
        this.element.style.backgroundColor = "green";
        this.element.appendChild(this.#createEntry(data));
    }
    warn(...data) {
        this.element.style.backgroundColor = "yellow";
        this.element.appendChild(this.#createEntry(data));
    }
    error(...data) {
        this.element.style.backgroundColor = "red";
        this.element.appendChild(this.#createEntry(data));
    }
    clear() {
        this.element.style.backgroundColor = "black";
    }
    #createEntry(...data) {
        const dataString = data.join(",");
        const p = document.createElement('p');
        p.innerText = dataString;
        return p;
    }
}
//#endregion
//#region Export
export { create, setLanguage, getContent, setContent, log, };
//#endregion
