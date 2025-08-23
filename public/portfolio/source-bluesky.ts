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

//#region Functions

async function parse(className: string): Promise<portfolio.ParsedEntry[]> {
    const name = `source-bluesky.parse()`;
    console.time(name);

    const parsedEntries: portfolio.ParsedEntry[] = [];

    const profileUri = `did:plc:ee5pxx436s7areoj4epw3voj`; // bsky.app/profile/harpyfox.net
    const maxDepth = 4;

    const elements = document.getElementsByClassName(className);
    const threadPromises = [];
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (!element) continue;

        const postUri = element.innerHTML;
        if (!postUri) {
            continue;
        }

        threadPromises[i] = getPostThread(profileUri, postUri, maxDepth);
    }

    const threads = await Promise.all(threadPromises);

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const thread = threads[i]?.thread;
        if (!element || !thread) continue;
        element.innerHTML = ``;
        parseThreadWithReplies(
            element,
            thread,
            0,
            maxDepth,
            (entry) => parsedEntries.push({ sourceElement: element, entry: entry })
        );

    }

    console.timeEnd(name);
    return parsedEntries;
}

function parseThreadWithReplies(parent: Element, postThread: BskyThreadViewPost, currentDepth: number, maxDepth: number, callback: (entry: portfolio.Entry) => void) {
    if (currentDepth > maxDepth) return;

    // always render top level posts, otherwise only render posts with embeds
    if (currentDepth == 0 || postThread.post.record.embed != null) {
        const entry: portfolio.Entry = parsePost(postThread.post);
        callback(entry);
    }

    if (postThread.replies) {
        for (const reply of postThread.replies) {
            parseThreadWithReplies(parent, reply, currentDepth + 1, maxDepth, callback);
        }
    }
}

async function getPostThread(profileUri: string, postUri: string, depth: number)  {

    const atUri = `at://${profileUri}/app.bsky.feed.post/${postUri}`;
    const searchParams = new URLSearchParams();
    searchParams.set(`uri`, atUri);
    searchParams.set(`depth`, `${depth}`);

    const response = await api(`/xrpc/app.bsky.feed.getPostThread`, searchParams);
    if (!response) return null;
    const json: { thread: BskyThreadViewPost } = await response.json();
    return json;
    
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



//#endregion

//#region Export

export { parse };

//#endregion
