// import * as monaco from 'monaco-editor';
// import * as monaco from '../../../../node_modules/monaco-editor/esm/vs/editor/editor.api';
// import * as monaco from '../../../../node_modules/monaco-editor/esm/vs/editor/';
const monaco = require("https://unpkg.com/monaco-editor/min/vs/loader.js");
//#region Variables

let currentEditor;
let log: Logger;

//#endregion

//#region Functions

function create(domElement: HTMLElement, logElement: HTMLElement) {
    currentEditor = monaco.editor.create(domElement, {
        value: `created from editor.ts!`,
        language: `typescript`
    });

    log = new Logger(logElement);
}

function setLanguage(language: string) {
    // [TODO]
    log.info(`setLanguage() not implemented yet. ${language}`)

}

function getContent(): string {
    // [TODO]
    return "getContent() not implemented yet.";
}

function setContent(code: string) {
    // [TODO]
    log.info(`setContent() not implemented yet. ${code}`)
    
}

class Logger {
    element: HTMLElement;

    constructor(domElement: HTMLElement) {
        this.element = domElement;
    }

    info(...data: any[]) {
        this.element.style.backgroundColor = "black";
        this.element.appendChild(this.#createEntry(data));
    }

    ok(...data: any[]) {
        this.element.style.backgroundColor = "green";
        this.element.appendChild(this.#createEntry(data));
    }

    warn(...data: any[]) {
        this.element.style.backgroundColor = "yellow";
        this.element.appendChild(this.#createEntry(data));
    }

    error(...data: any[]) {
        this.element.style.backgroundColor = "red";
        this.element.appendChild(this.#createEntry(data));
    }

    clear() {
        this.element.style.backgroundColor = "black";
    }

    #createEntry(...data: any[]): HTMLElement {
        const dataString = data.join(",");

        const p = document.createElement('p');
        p.innerText = dataString;
        return p;
    }
}

//#endregion

//#region Export

export {
    create,
    setLanguage,
    getContent,
    setContent,
    log,
};

//#endregion