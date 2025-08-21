import * as m3u8Loader from "./m3u8-loader.js";
//#endregion
//#region Functions
async function parse(className) {
    const profileUri = `did:plc:ee5pxx436s7areoj4epw3voj`; // bsky.app/profile/harpyfox.net
    const maxDepth = 4;
    const elements = document.getElementsByClassName(className);
    for (const element of elements) {
        const postUri = element.innerHTML;
        if (!postUri) {
            continue;
        }
        const postThread = await getPostThread(profileUri, postUri, maxDepth);
        if (!postThread) {
            continue;
        }
        element.innerHTML = ``;
        createReplyElements(element, postThread.thread, 0, maxDepth);
    }
}
function createReplyElements(parent, postThread, currentDepth, maxDepth) {
    if (currentDepth > maxDepth)
        return;
    // always render top level posts, otherwise only render posts with embeds
    if (currentDepth == 0 || postThread.post.record.embed != null) {
        const element = createElement(parent, postThread.post);
    }
    if (postThread.replies) {
        for (const reply of postThread.replies) {
            createReplyElements(parent, reply, currentDepth + 1, maxDepth);
        }
    }
}
async function getPostThread(profileUri, postUri, depth) {
    const atUri = `at://${profileUri}/app.bsky.feed.post/${postUri}`;
    const searchParams = new URLSearchParams();
    searchParams.set(`uri`, atUri);
    searchParams.set(`depth`, `${depth}`);
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
function createElement(parent, post) {
    const div = parent.appendChild(document.createElement('div'));
    div.classList.add(`bluesky`, `portfolio-entry`);
    let html = `<dl>`;
    html += `<dt>uri=</dt><dd>${post.uri}</dd>`;
    html += `<dt>record.$type=</dt><dd>${post.record.$type}</dd>`;
    html += `<dt>record.createdAt=</dt><dd>${post.record.createdAt}</dd>`;
    html += `<dt>record.text=</dt><dd>${post.record.text}</dd>`;
    html += `<dt>record.embed=</dt><dd>${post.record.embed ? post.record.embed.$type : "(none)"}</dd>`;
    html += `</dl>`;
    const details = document.createElement('details');
    div.appendChild(details);
    details.innerHTML = html;
    if (post.record.embed) {
        const embed = post.record.embed;
        switch (embed.$type) {
            case "app.bsky.embed.video":
                div.classList.add(`portfolio-video`);
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
                m3u8Loader.loadAndAttach(video);
                break;
            case "app.bsky.embed.images":
                div.classList.add(`portfolio-image`);
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
    else {
        div.classList.add(`portfolio-text`);
    }
    return div;
}
//#endregion
export { parse };
