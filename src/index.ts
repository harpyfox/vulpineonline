import { readdir } from "node:fs";

interface Env {
    ASSETS: Fetcher;
}

export default {
    async fetch(request: Request, env: Env, ctx) {
        const url = new URL(request.url);

        console.log(`I am ${navigator.userAgent}.\n`
            + `Welcome to ${url}.\n` 
            + `Your ${url.protocol} ${request.method}\n`
            + `env: ${env}\n`,
            + `ctx: ${ctx}`);

        return env.ASSETS.fetch(request);
    }
};

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
