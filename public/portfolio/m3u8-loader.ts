import Hls from "../packages/hls/hls.light.js";
import type { Events, HlsConfig, MediaAttachedData } from "../packages/hls/hls.light.js";

declare global {
    interface Window {
        Hls: Hls;
    }
}

function loadAndAttach(video: HTMLVideoElement): Hls | null {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.info(`m3u8-loader.js: your browser supports m3u8 natively! i won't do anything then.`);
        return null;
    }

    if (!Hls.isSupported()) {
        console.error(`m3u8-loader.js: hls is not supported on your browser.`);
        return null;
    }

    // https://github.com/video-dev/hls.js/blob/master/docs/API.md
    
    
    const config: Partial<HlsConfig> = {
        capLevelToPlayerSize: true,
        autoStartLoad: false,
        startFragPrefetch: true,        
    };

    const hlsInstance = new Hls(config);
    

    hlsInstance.on(Hls.Events.MEDIA_ATTACHED, onMediaAttached);
    hlsInstance.autoLevelCapping = 0;

    hlsInstance.loadSource(video.src);
    hlsInstance.attachMedia(video);
    return hlsInstance;
}

function onMediaAttached(event: Events.MEDIA_ATTACHED, data: MediaAttachedData) {
    console.log(`MEDIA_ATTACHED`, data);
}

export { loadAndAttach };