interface Env {
    ASSETS: Fetcher;
}

export default {
    async fetch(request, env: Env): Promise<Request> {
        const url = new URL(request.url);

        console.log(`Hello ${navigator.userAgent}!\n`
            + `Welcome to ${url.hostname} specifically ${url.pathname}!\n` 
            + `Your ${url.protocol} ${request.method} request is very nice\n`
            + ``);

        return env.ASSETS.fetch(request);
    }
};
