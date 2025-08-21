import * as m3u8Loader from "./m3u8-loader.js";
//#endregion
//#region Functions
const blueskyClassName = "bluesky";
async function scan(node) {
    const profileUri = `did:plc:ee5pxx436s7areoj4epw3voj`; // bsky.app/profile/harpyfox.net
    if (node === void 0) {
        node = document;
    }
    const embeds = node.querySelectorAll(`.${blueskyClassName}`);
    for (const embed of embeds) {
        const postUri = embed.innerHTML;
        if (!postUri) {
            continue;
        }
        const postThread = await getPostThread(profileUri, postUri);
        if (!postThread) {
            continue;
        }
        embed.innerHTML = ``;
        const headElement = await createElement(embed, postThread.thread.post);
        for (const reply of postThread.thread.replies) {
            const element = await createElement(embed, reply.post);
        }
        await m3u8Loader.scan();
    }
    // [TODO] probably put this in a worker or something..........
    //await m3u8Loader.scan();
}
async function getPostThread(profileUri, postUri) {
    const atUri = `at://${profileUri}/app.bsky.feed.post/${postUri}`;
    const searchParams = new URLSearchParams();
    searchParams.set(`uri`, atUri);
    const response = await api(`/xrpc/app.bsky.feed.getPostThread`, searchParams);
    if (!response)
        return null;
    const json = await response.json();
    console.log(json);
    return json;
}
async function api(endpoint, searchParams) {
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
    catch (error) {
        console.error(error.message);
    }
    return null;
}
async function createElement(parent, post) {
    const div = parent.appendChild(document.createElement('div'));
    div.className = "bluesky-post";
    let html = `<dl>`;
    html += `<dt>uri=</dt><dd>${post.uri}</dd>`;
    html += `<dt>record.$type=</dt><dd>${post.record.$type}</dd>`;
    html += `<dt>record.createdAt=</dt><dd>${post.record.createdAt}</dd>`;
    html += `<dt>record.text=</dt><dd>${post.record.text}</dd>`;
    html += `<dt>record.embed=</dt><dd>${post.record.embed ? post.record.embed.$type : "(none)"}</dd>`;
    html += `</dl>`;
    div.innerHTML = html;
    if (post.record.embed) {
        const embed = post.record.embed;
        switch (embed.$type) {
            case "app.bsky.embed.video":
                const blob = embed.video;
                const thumbnailSrc = `https://video.cdn.bsky.app/hls/${post.author.did}/${blob.ref.$link}/thumbnail.jpg`;
                const video = document.createElement(`video`);
                video.className = `bluesky-video`;
                video.autoplay = true;
                video.poster = thumbnailSrc;
                video.controls = true;
                //@ts-ignore
                video.controlslist = "nodownload noremoteplayback";
                video.disablePictureInPicture = true;
                video.disableRemotePlayback = true;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                //video.preload = "metadata";
                video.id = blob.ref.$link;
                video.src = `https://video.bsky.app/watch/${post.author.did}/${blob.ref.$link}/playlist.m3u8`;
                div.appendChild(video);
                break;
            case "app.bsky.embed.images":
                for (const image of embed.images) {
                    const thumbnailSrc = `https://cdn.bsky.app/img/feed_thumbnail/plain/${post.author.did}/${image.image.ref.$link}@jpeg`;
                    const fullSrc = `https://cdn.bsky.app/img/feed_fullsize/plain/${post.author.did}/${image.image.ref.$link}@jpeg`;
                    const img = document.createElement('img');
                    img.className = 'bluesky-thumbnail';
                    img.src = thumbnailSrc;
                    div.appendChild(img);
                    const a = document.createElement('a');
                    a.href = fullSrc;
                    a.innerText = `link to fullsize`;
                    div.appendChild(a);
                }
                break;
            default:
                div.appendChild(document.createTextNode("unhandled embed type!"));
                break;
        }
    }
    return div;
}
//#endregion
//#region Side effects
if (['interactive', 'complete'].indexOf(document.readyState) !== -1) {
    scan();
}
else {
    document.addEventListener('DOMContentLoaded', () => scan());
}
//#endregion
