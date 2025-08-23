import * as m3u8Loader from "./m3u8-loader.js";
import * as blueskySource from "./source-bluesky.js";
import * as localSource from "./source-local.js";

//#region Types

interface Entry {
    text: string;
    embed: (ImageEmbed | VideoEmbed | LinkEmbed)[] | null;
}

interface Embed {
    type: string;
    thumbnailUrl: string;
    url: string;
}

interface ImageEmbed extends Embed {
    type: "image";
}

interface VideoEmbed extends Embed {
    type: "video";
}

interface LinkEmbed extends Embed {
    type: "link";
}

interface ParsedEntry {
    sourceElement: Element;
    entry: Entry;
}

//#endregion

//#region Variables

const entryElementMap: { entry: Entry, element: Element }[] = [];

//#endregion

//#region Functions

function createElement(parent: Element, entry: Entry) {
    const div = parent.appendChild(document.createElement('div'));

    div.classList.add(`portfolio-entry`);

    const details = div.appendChild(document.createElement('details'));
    details.innerHTML = `${entry.text}`;

    if (entry.embed) {
        for (const embed of entry.embed) {

            switch (embed.type) {

                case "image":
                    const img = div.appendChild(document.createElement('img'));
                    img.src = embed.thumbnailUrl;
                    const a = div.appendChild(document.createElement('a'));
                    a.href = embed.url;
                    a.innerText = `link to fullsize`;
                    break;

                case "video":
                    const video = div.appendChild(document.createElement(`video`));
                    //video.autoplay = true;
                    video.controls = false;
                    video.disablePictureInPicture = true;
                    video.disableRemotePlayback = true;
                    video.loop = true;
                    video.muted = true;
                    video.playsInline = true;
                    //video.preload = "metadata";

                    video.poster = embed.thumbnailUrl;
                    video.src = embed.url;

                    let hls = null;
                    if (video.src.endsWith('m3u8')) hls = m3u8Loader.loadAndAttach(video);

                    div.onmouseenter = (event) => {
                        if (hls && !hls.loadingEnabled) hls.startLoad();
                        video.play();
                        video.loop = true;
                        video.onended = null;
                    }
                    div.onmouseleave = (event) => {
                        video.loop = false;
                        video.onended = (event) => {
                            video.currentTime = 0;
                        }
                    }
                    
                    break;
                
                default:
                    break;

            }
        }
    }

    return div;
}

async function build() {

    const name = `portfolio.build()`;
    console.info(name);
    console.time(name);

    const blueskyEntries = await blueskySource.parse(`source-bluesky`);
    const localEntries = await localSource.parse(`source-local`);

    const parsedEntries = [
        blueskyEntries,
        localEntries,
    ].flat(1); 
    
    console.time(`portfolio.createElements()`);
    for (const parsedEntry of parsedEntries) {
        const element = createElement(parsedEntry.sourceElement, parsedEntry.entry);
        entryElementMap.push({ entry: parsedEntry.entry, element: element });
    }
    console.timeEnd(`portfolio.createElements()`);

    console.timeEnd(name);
    console.info(`${name} built ${entryElementMap.length} entries!`, entryElementMap);
}

//#endregion

//#region Export

export { build };
export type { ParsedEntry, Entry, Embed, ImageEmbed, VideoEmbed, LinkEmbed };

//#endregion