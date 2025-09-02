async function main() {
    for (const video of document.getElementsByTagName('video')) {
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        if (!video.hasAttribute('controls')) {
            video.controls = false;
        }
        video.disablePictureInPicture = true;
    }
}
if (['interactive', 'complete'].indexOf(document.readyState) !== -1) {
    main();
}
else {
    document.addEventListener('DOMContentLoaded', () => main());
}
export {};
