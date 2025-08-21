import { WorkerEntrypoint } from "cloudflare:workers";

export type Env = {
    ASSETS: Fetcher;
};

export default class<TEnv extends Env = Env> extends WorkerEntrypoint<TEnv> {
    override async fetch(request: Request) {
        return this.env.ASSETS.fetch(request);
    }
}