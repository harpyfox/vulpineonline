import { WorkerEntrypoint } from "cloudflare:workers";

export type Env = {
    ASSETS: Fetcher;
};

export default class<TEnv extends Env = Env> extends WorkerEntrypoint<TEnv> {
    override async fetch(request: Request) {

        const url = new URL(request.url);
        if (url.pathname.startsWith("/api/")) {
            const object = {
                name: "i'm an api"
            };
            const response = new Response(JSON.stringify(object), {
                headers: { "Content-Type": "application/json" },
            });
            return response;
        }

        return this.env.ASSETS.fetch(request);
    }
}