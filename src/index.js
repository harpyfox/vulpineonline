import { WorkerEntrypoint } from "cloudflare:workers";
export default class extends WorkerEntrypoint {
    async fetch(request) {
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
