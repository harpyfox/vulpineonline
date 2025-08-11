import { readdir } from "node:fs";
import { WorkerEntrypoint } from "cloudflare:workers";

// interface Env {
//     ASSETS: Fetcher;
// }

export type Env = {
    ASSETS: Fetcher;
    ASSETS_MANIFEST: ArrayBuffer;
    __STATIC_ASSETS_CONTENT_MANIFEST;
};

export default class<TEnv extends Env = Env> extends WorkerEntrypoint<TEnv> {
    async fetch(request: Request) {
        console.log(`extending worker~! ${request} ${this.env.ASSETS} ${this.env.__STATIC_CONTENT} ${this.env.__STATIC_ASSETS_CONTENT_MANIFEST} ${this.env.__STATIC_CONTENT_MANIFEST}`);
        return this.env.ASSETS.fetch(request);
    }
}

// export default {
//     async fetch(request: Request, env: Env, ctx: ExecutionContext) {
//         const url = new URL(request.url);

//         console.log(`I am ${navigator.userAgent}.\n`
//             + `Welcome to ${url}.\n` 
//             + `Your ${url.protocol} ${request.method}\n`
//             + `env: ${env}\n`,
//             + `ctx: ${ctx}`);

//         return env.ASSETS.fetch(request);
//     }
// };

function buildIndex(env: Env, path: string): string {

    const directoryFiles: string[] = [];
    readdir("./", (error, files) => {
        if (error) {
            directoryFiles.push("fs.readdir failed to execute");
        } else {
            for (const file of files) {
                directoryFiles.push(file);
            }
        }
    });
    
    const html = 
    `<!DOCTYPE html>
    <html>
        <body>
            <h1>index of ${path}</h1>
            <ul>
                ${directoryFiles.map(file => `<li>${file}</li>`).join("")}
            </ul>
        </body>
    </html>`;

    console.log(`buildIndex(${path}): ${html}`);

    return html;
}
