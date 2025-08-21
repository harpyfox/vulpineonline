// https://github.com/video-dev/hls.js/blob/master/src/loader/m3u8-parser.ts
// https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery/Setting_up_adaptive_streaming_media_sources
function loadAndAttach(video) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.info(`m3u8-loader.js: your browser supports m3u8 natively! i won't do anything then.`);
        return;
    }
    //@ts-ignore
    const hls = new Hls();
    hls.loadSource(video.src);
    hls.attachMedia(video);
}
async function scan() {
    console.log(`scan()`);
    let videoElements = document.getElementsByTagName('video');
    for (const video of videoElements) {
        console.log(`scan() video=${video}`);
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            console.info(`m3u8-loader.js: your browser supports m3u8 natively! i won't do anything then.`);
            return;
        }
        const src = video.src;
        if (src.endsWith(".m3u8")) {
            console.log(`scan() found .m3u8 video.src ${src}`);
            // [TODO] i wish this worked oh well
            video.removeAttribute('src');
            const sourcem3u8 = document.createElement(`source`);
            sourcem3u8.src = src;
            sourcem3u8.type = "application/vnd.apple.mpegurl";
            console.log(`scan() created source type=${sourcem3u8.type} src=${sourcem3u8.src}`);
            video.appendChild(sourcem3u8);
            const blob = await loadSource(src);
            if (!blob)
                continue;
            console.log(`scan() got blob ${blob}`);
            const sourcemp4 = document.createElement(`source`);
            sourcemp4.src = URL.createObjectURL(blob);
            sourcemp4.type = "video/mp4";
            console.log(`scan() created source type=${sourcemp4.type} src=${sourcemp4.src}`);
            video.appendChild(sourcemp4);
            video.load();
        }
    }
}
async function loadSource(baseUrl) {
    // handle master playlist
    const masterPlaylistResponse = await fetch(baseUrl);
    const masterPlaylist = await masterPlaylistResponse.text();
    const parsedVariantPlaylist = parseMasterPlaylist(masterPlaylist, baseUrl);
    // handle level playlist
    const levelDetails = parsedVariantPlaylist[0];
    if (!levelDetails)
        return null;
    const levelPlaylistResponse = await fetch(levelDetails.url);
    const levelPlaylist = await levelPlaylistResponse.text();
    const blobPartUrls = parseLevelPlaylist(levelPlaylist, levelDetails.url.toString());
    // download the parts and combine!
    const blobParts = await downloadParts(blobPartUrls);
    const blob = new Blob(blobParts, { type: "video/mp4" });
    console.log(blob);
    return blob;
}
/*
example masterPlaylist:
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:PROGRAM-ID=0,BANDWIDTH=550000,CODECS="avc1.640015",RESOLUTION=424x360
360p/video.m3u8?session_id=d2j9rag204ps72pjep2g
#EXT-X-STREAM-INF:PROGRAM-ID=0,BANDWIDTH=3300000,CODECS="avc1.64001f",RESOLUTION=848x720
720p/video.m3u8?session_id=d2j9rag204ps72pjep2g
*/
function parseMasterPlaylist(playlist, baseUrl) {
    const parsed = [];
    const lines = playlist.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line?.startsWith('#EXT-X-STREAM-INF')) {
            const resolutionMatches = line.match(/RESOLUTION=(\d+)x(\d+)/);
            if (!resolutionMatches)
                continue;
            const width = resolutionMatches[1] ? parseInt(resolutionMatches[1]) : 0;
            const height = resolutionMatches[2] ? parseInt(resolutionMatches[2]) : 0;
            const path = lines[i + 1];
            if (!path)
                continue;
            const url = new URL(path, baseUrl);
            parsed.push({ width, height, url });
        }
    }
    return parsed;
}
/*
example levelPlaylist:
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-TARGETDURATION:6
#EXTINF:6.000,
video0.ts?session_id=&dur=6.000000
#EXTINF:6.000,
video1.ts?session_id=&dur=6.000000
#EXTINF:0.667,
video2.ts?session_id=&dur=0.666667
#EXT-X-ENDLIST
*/
function parseLevelPlaylist(playlist, baseUrl) {
    const parsed = [];
    const lines = playlist.split('\n');
    // Array.prototype.filter() == System.Linq.Where()
    const paths = lines.filter(line => !line.startsWith('#') && line.trim() !== '');
    // Array.prototype.map() == System.Linq.Select()
    paths.map(path => parsed.push({ url: new URL(path, baseUrl) }));
    return parsed;
}
async function downloadParts(blobPartUrls) {
    const blobParts = [];
    for (let i = 0; i < blobPartUrls.length; i++) {
        const url = blobPartUrls[i];
        if (!url)
            continue;
        const response = await fetch(url.url); //bro
        const part = await response.arrayBuffer();
        blobParts.push(part);
    }
    return blobParts;
}
export { loadAndAttach };
