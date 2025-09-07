import { WorkerEntrypoint } from "cloudflare:workers";

export type Env = {
    ASSETS: Fetcher;
    KV: KVNamespace;
};

export default class<TEnv extends Env = Env> extends WorkerEntrypoint<TEnv> {
    override async fetch(request: Request) {
        const cloudflare = request.cf;
        if (request.headers.get("Sec-Fetch-Mode") == "navigate") console.log(request);

        const url = new URL(request.url);
        if (url.pathname.startsWith("/api/")) {
            return this.api(url);
        }

        const response = await this.env.ASSETS.fetch(request);

        this.tryPutHit(request, response); // don't await this!!
        
        return response;
    }

    // hit counter!
    async tryPutHit(request: Request, response: Response) {
        console.log(`tryPutHit`, response.url);
        if (request.headers.get("Sec-Fetch-Mode") != "navigate") return;
        if (!response.ok) return;
        
        const key = new URL(response.url).pathname;

        let value: any | null = await this.env.KV.get(key, "json");
        if (!value) {
            value = {
                hits: 0,
            };
        }
        if (!value.hits) value.hits = 0;

        value.hits++;
        await this.env.KV.put(key, value);
    }

    async api(url: URL): Promise<Response> {

        const endpoint: string = url.pathname.slice("/api/".length);
        const auth = false;

        switch (endpoint) {
            case "getHits":
                // getHits?hostname=

                break;
            case "putHits":
        
            default:
                break;
        }

        const object = {
            url: url.toString(),
            endpoint: endpoint,
        };
        const response = new Response(JSON.stringify(object), {
            headers: { "Content-Type": "application/json" },
        });
        return response;

    }
}

//https://github.com/cloudflare/workerd/blob/main/samples/static-files-from-disk/static.js