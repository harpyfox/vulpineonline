import type * as portfolio from "./portfolio.js";

//#region Types

interface BskyPost {
    $type: string;
    text: string;
    createdAt: string;
    embed: BskyEmbed;
}

interface BskyEmbed {
    $type: string;
    video: BskyBlob;
    images: Array<{
        alt: string;
        image: BskyBlob;
    }>;
    external: {
        uri: string;
        title: string;
        description: string;
        thumb: BskyBlob;
    };
}

interface BskyBlob {
    $type: string;
    ref: { $link: string; };
    mimeType: string;
    size: number;
}

interface BskyPostView {
    cid: string;
    uri: string;
    author: any;
    record: BskyPost;
}

interface BskyThreadViewPost {
    $type: string;
    parent: BskyThreadViewPost;
    post: BskyPostView;
    replies: Array<BskyThreadViewPost>;
}

//#endregion

// all my bluesky portfolio posts are under a single parent thread, so we can just fetch that
// and search it for any child posts instead of performing a fetch for every post.
const cacheSrc = `at://did:plc:ee5pxx436s7areoj4epw3voj/app.bsky.feed.post/3lrppfou7z22r`;
let cache: Map<string, BskyThreadViewPost> = new Map();

//#region Functions

async function parse(attribute: string): Promise<portfolio.EntryView[]> {
    const name = `source-bluesky.parse()`;
    console.time(name);

    // build cache
    console.log(`building cache`);
    cache = new Map();
    const depth = 6;

    const thread = await getPostThread(cacheSrc, depth, true);
    if (thread) {
        walkThread(thread, 0, depth, (u, t) => cache.set(u, t));
    }
    console.log(`built cache`, cache);

    const entryViews: portfolio.EntryView[] = [];
    
    const elements = document.querySelectorAll(`[${attribute}]`);
    const threadPromises = [];
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        if (!element) continue;
        
        const uri = element.getAttribute(attribute);
        if (uri === null) continue;

        threadPromises[i] = getPostThread(uri, 1);
    }

    const threads = await Promise.all(threadPromises);

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        const thread = threads[i];
        if (!element || !thread) continue;
        entryViews.push({ element: element, entry: parsePost(thread.post) });
    }

    console.timeEnd(name);

    return entryViews;
}

async function getPostThread(uri: string, depth: number, ignoreCache: boolean = false)  {

    if (!ignoreCache) {
        const cacheHit = cache.get(uri);
        if (cacheHit) {
            console.log(`cache HIT on`, uri);
            return Promise.resolve(cacheHit);
        } else {
            console.warn(`cache MISS on`, uri);
        }
    }

    const searchParams = new URLSearchParams();
    searchParams.set(`uri`, uri);
    searchParams.set(`depth`, `${depth}`);

    const response = await api(`/xrpc/app.bsky.feed.getPostThread`, searchParams);
    if (!response) return null;
    const json: { thread: BskyThreadViewPost } = await response.json();
    return json.thread;
    
}

function walkThread(postThread: BskyThreadViewPost, currentDepth: number, maxDepth: number, callback: (uri: string, thread: BskyThreadViewPost) => void) {
    if (currentDepth > maxDepth) return;

    callback(postThread.post.uri, postThread);

    if (postThread.replies) {
        for (const reply of postThread.replies) {
            walkThread(reply, currentDepth + 1, maxDepth, callback);
        }
    }
}

async function api(endpoint: string, searchParams: URLSearchParams) {
    const api = `https://public.api.bsky.app`;
    const url = new URL(endpoint, api);
    searchParams.forEach((value, key) => url.searchParams.set(key, value));

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`repsonds ${response.status}`);
        }

        return response;
    }
    catch (error: any) {
        console.error(error.message);
    }

    return null;
}

function parsePost(post: BskyPostView): portfolio.Entry {
    const entry: portfolio.Entry = {
        text: post.record.text,
        embed: null,
    };

    if (post.record.embed) {
        const embed = post.record.embed;

        entry.embed = [];

        switch (embed.$type) {

            case "app.bsky.embed.video":
                const blob = embed.video;
                entry.embed.push({
                    type: "video",
                    thumbnailUrl: `https://video.cdn.bsky.app/hls/${post.author.did}/${blob.ref.$link}/thumbnail.jpg`,
                    url: `https://video.bsky.app/watch/${post.author.did}/${blob.ref.$link}/playlist.m3u8`,
                });
                break;

            case "app.bsky.embed.images":
                entry.embed = [];
                for (let i = 0; i <= embed.images.length || i <= 3; i++) {
                    const image = embed.images[i];
                    if (!image) break;

                    entry.embed[i] = {
                        type: "image",
                        thumbnailUrl: `https://cdn.bsky.app/img/feed_thumbnail/plain/${post.author.did}/${image.image.ref.$link}@jpeg`,
                        url: `https://cdn.bsky.app/img/feed_fullsize/plain/${post.author.did}/${image.image.ref.$link}@jpeg`,
                    };
                }
                break;
            
            case "app.bsky.embed.external":
                // [TODO]
                entry.embed = null;

            default:
                entry.embed = null;
                break;
        }
    }

    return entry;
}

function renderCache(attribute: string) {
    for (const t of cache.values()) {
        const article = document.body.appendChild(document.createElement('article'));
        article.className = 'listing';
        article.setAttribute(attribute, t.post.uri);
    }
}

//#endregion

//#region Export

export { parse };

//#endregion
