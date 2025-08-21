import { WorkerEntrypoint } from "cloudflare:workers";
export default class extends WorkerEntrypoint {
    async fetch(request) {
        return this.env.ASSETS.fetch(request);
    }
}
