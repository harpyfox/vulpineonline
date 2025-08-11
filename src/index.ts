interface Env {
    ASSETS: Fetcher;
}

export default {
    async fetch(request: Request, env: Env, ctx) {
        const url = new URL(request.url);


        console.log(`Hello ${navigator.userAgent}!\n`
            + `Welcome to ${url.hostname} specifically ${url.pathname}!\n` 
            + `Your ${url.protocol} ${request.method} request is very nice\n`
            + `env: ${env}\n`,
            + `ctx: ${ctx}`);
        
            console.log(env.ASSETS_MANIFEST);

        console.log(await buildIndex(env, "./"));

        return env.ASSETS.fetch(request);
    }
};

async function buildIndex(env: Env, path: string): Promise<Response> {
    const files: string[] = [];
    try {
        console.log(env.ASSETS);
        const rawFiles = await env.ASSETS.list();
        for (const file of rawFiles) {
            files.push(file);
        }
    } catch (error) {
        console.error(error.message);
        files.push("FUCK");
    }
    
    const html = 
    `<!DOCTYPE html>
    <html>
        <body>
            <h1>im a worker</h1>
            <ul>
                ${files.map(file => `<li>${file}</li>`).join("")}
            </ul>
        </body>
    </html>`;

    console.log(`buildIndex(${path}): ${html}`);

    return new Response(html, {
        headers: {
            "content-type": "text/html; charset=UTF-8",
        },
    });
}
