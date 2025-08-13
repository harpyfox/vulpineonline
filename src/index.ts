import { WorkerEntrypoint } from "cloudflare:workers";
import * as monaco from "monaco-editor/esm/vs/editor/editor.main.js";

export type Env = {
    ASSETS: Fetcher;
};

export default class<TEnv extends Env = Env> extends WorkerEntrypoint<TEnv> {
    async fetch(request: Request) {
        return this.env.ASSETS.fetch(request);
    }
}