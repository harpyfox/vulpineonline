import * as m3u8Loader from "./m3u8-loader.js";
import * as blueskySource from "./source-bluesky.js";
//#endregion
//#region Variables
const entryElementMap = [];
//#endregion
//#region Functions
function render(entryView) {
    const entry = entryView.entry;
    if (entry.embed) {
        let parent = entryView.element;
        for (let i = 0; i < entry.embed.length; i++) {
            const embed = entry.embed[i];
            if (!embed)
                continue;
            if (i != 0) {
                const newParent = parent.cloneNode();
                if (newParent) {
                    //@ts-expect-error
                    parent.after(newParent);
                    parent = newParent;
                }
            }
            const a = parent.appendChild(document.createElement('a'));
            a.href = embed.url;
            switch (embed.type) {
                case "image":
                    const img = a.appendChild(document.createElement('img'));
                    img.src = embed.thumbnailUrl;
                    break;
                case "video":
                    const video = a.appendChild(document.createElement(`video`));
                    //video.autoplay = true;
                    video.controls = false;
                    video.disablePictureInPicture = true;
                    video.loop = true;
                    video.muted = true;
                    video.playsInline = true;
                    //video.preload = "metadata";
                    video.poster = embed.thumbnailUrl;
                    video.src = embed.url;
                    let hls = null;
                    if (video.src.endsWith('m3u8'))
                        hls = m3u8Loader.loadAndAttach(video);
                    parent.onmouseenter = (event) => {
                        if (hls && !hls.loadingEnabled)
                            hls.startLoad();
                        video.play();
                        video.loop = true;
                        video.onended = null;
                    };
                    parent.onmouseleave = (event) => {
                        video.loop = false;
                        video.onended = (event) => {
                            video.currentTime = 0;
                        };
                    };
                    break;
                default:
                    break;
            }
            //const p = a.appendChild(document.createElement('p'));
            //p.innerText = `title`;
        }
    }
    //const p = entryView.element.appendChild(document.createElement('p'));
    //p.innerHTML = `${entry.text}`;
}
async function build() {
    const name = `portfolio.build()`;
    console.info(name);
    console.time(name);
    const blueskyEntries = await blueskySource.parse(`data-bluesky-src`);
    const entryViews = [
        blueskyEntries,
    ].flat(1);
    console.time(`portfolio.render()`);
    for (const entryView of entryViews) {
        render(entryView);
        entryElementMap.push(entryView);
    }
    console.timeEnd(`portfolio.render()`);
    console.timeEnd(name);
    console.info(`${name} built ${entryElementMap.length} entries!`, entryElementMap);
    for (const video of document.getElementsByTagName('video')) {
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.controls = false;
        video.disablePictureInPicture = true;
    }
}
//#endregion
//#region Export
export { build };
//#endregion
