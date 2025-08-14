import { WorkerEntrypoint } from "cloudflare:workers";
import * as monaco from "monaco-editor/esm/vs/editor/editor.main.js";

export type Env = {
    ASSETS: Fetcher;
};

export default class<TEnv extends Env = Env> extends WorkerEntrypoint<TEnv> {
    async fetch(request: Request) {
        

        self.MonacoEnvironment = {
            getWorkerUrl: function (moduleId, label) {
                if (label === 'json') {
                    return './vs/language/json/json.worker.js';
                }
                if (label === 'css' || label === 'scss' || label === 'less') {
                    return './vs/language/css/css.worker.js';
                }
                if (label === 'html' || label === 'handlebars' || label === 'razor') {
                    return './vs/language/html/html.worker.js';
                }
                if (label === 'typescript' || label === 'javascript') {
                    return './vs/language/typescript/ts.worker.js';
                }
                return './vs/editor/editor.worker.js';
            }
        };

        monaco.editor.create(document.getElementById('container'), {
            value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
            language: 'javascript'
        });

        return this.env.ASSETS.fetch(request);
    }
}