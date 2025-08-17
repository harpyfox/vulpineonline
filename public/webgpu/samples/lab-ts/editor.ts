//#region Types

interface IMonacoSetup {
    loaderUrl: string;
    loaderConfigPaths: Record<string, string>;
    codiconUrl: string;
}

interface Window {
    monaco: any;
}

//#endregion

//#region Variables

// the editor is an instance of 'monaco-editor'. i yoinked this implementation from microsoft's playground site:
// https://microsoft.github.io/monaco-editor/playground.html
// const monacoCore = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/dev/vs"
/* THIS IS THE POWER OF THE */ const monacoCore = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/dev/vs"
//let monaco: any; // ????????????

let currentEditor: any;
let log: Logger;

//#endregion

//#region Fx - Editor

async function create(domElement: HTMLElement, logElement: HTMLElement) {
    
    console.group("editor.create()")
    console.time("editor.create()");

    log = new Logger(logElement);
    console.info("initialised logger");

    const monaco = await loadMonaco();
    currentEditor = monaco.editor.create(domElement, {
        language: "wgsl",

        placeholder: `lets write a shader!`,
        //value: ``,

        automaticLayout: true,
        readOnly: false,

        theme: "hc-black",
        lineNumbers: "on",
        lineNumbersMinChars: 3,
        multiCursorLimit: 1,
        roundedSelection: false,

        overviewRulerBorder: false,
        scrollBeyondLastLine: false,
        showFoldingControls: "always",
        minimap: {
            enabled: false,
        },
        scollbar: {
            useShadows: false,
        },

        colorDecorators: true,
    });
    console.info("initialised editor");

    console.timeEnd("editor.create()");
    console.groupEnd();
}



function setLanguage(language: string) {
    // [TODO]
    log.info(`setLanguage() not implemented yet. ${language}`)

}

function setTheme(theme: string) {
    if (monaco) {
        monaco.editor.setTheme(theme);
    }
}

function getContent(): string {
    // [TODO]
    if (currentEditor) {
        return currentEditor.getValue();
    }
    return "currentEditor is null, please investigate.";
}

function setContent(code: string) {
    // [TODO]
    if (currentEditor) {
        currentEditor.setValue(code);
    }
    
}

function colorizeElement(domElement: HTMLElement) {
    if (monaco) {
        monaco.editor.colorizeElement(domElement);
    }
}

//#endregion

//#region Fx - Logger

class Logger {
    element: HTMLElement;

    constructor(domElement: HTMLElement) {
        this.element = domElement;
    }

    info(...data: any[]) {
        // this.element.style.backgroundColor = "black";
        // this.element.appendChild(this.#createEntry(data));
    }

    ok(...data: any[]) {
        // this.element.style.backgroundColor = "green";
        // this.element.appendChild(this.#createEntry(data));
    }

    warn(...data: any[]) {
        // this.element.style.backgroundColor = "yellow";
        // this.element.appendChild(this.#createEntry(data));
    }

    error(...data: any[]) {
        // this.element.style.backgroundColor = "red";
        // this.element.appendChild(this.#createEntry(data));
    }

    clear() {
        // this.element.style.backgroundColor = "black";
    }

    #createEntry(...data: any[]): HTMLElement {
        const dataString = data.join(",");

        const p = document.createElement('p');
        p.innerText = dataString;
        return p;
    }
}

//#endregion

//#region Fx - Loader

async function loadMonaco(): Promise<typeof global.monaco> {
    const setup: IMonacoSetup = getMonacoSetup(monacoCore);

    // monaco editor website does this so ill do it too. i DO NOT UNDERSTAND WHAT IS HAPPENING
    const global = self as any;
    if (!(global as any).require) {
        await loadScript(setup.loaderUrl);
        console.info("injected editor <script>");
    }

    global.getCodiconPath = () => {
        return setup.codiconUrl;
    };

    // i think loadScript caused global.require to be assigned to an object or something
    const loader = global.require;
    loader.config({ 
        paths: setup.loaderConfigPaths
    });

    return new Promise((res) => {
        loader(["vs/editor/editor.main"], () => {
            res(global.monaco);
        });
    });
}

function getMonacoSetup(path: string): IMonacoSetup {
    return {
        loaderUrl: `${path}/loader.js`,
        loaderConfigPaths: {
            vs: `${path}`,
        },
        codiconUrl: `${path}/base/browser/ui/codicons/codicon/codicon.ttf`,
    }
}

// THIS FEELS FUCKIN DODGY BUT WHATEVER GO
function loadScript(path: string): Promise<void> {
    return new Promise((res) => {
        const script = document.createElement(`script`);
        script.onload = () => res(); // typescript hallucinating 2 references yeah alright
        script.async = true;
        script.type = `text/javascript`;
        script.src = path;
        document.head.appendChild(script);
    });
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