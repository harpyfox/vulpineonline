let viewer, viewerImage, viewerVideo, viewerCaption;
document.addEventListener('DOMContentLoaded', (event) => {
    viewer = document.getElementById('viewer');
    viewerImage = viewer.querySelector("img");
    viewerVideo = viewer.querySelector("video");
    viewerCaption = viewer.querySelector('figcaption');
    viewer.style.display = "none";
    console.debug(`viewer`, viewer);

    for (const image of document.querySelectorAll('article > img')) { addViewerListener(image); }
    for (const video of document.querySelectorAll('article > video')) { addViewerListener(video); }
    for (const figure of document.querySelectorAll('figure:not(#viewer)')) { addViewerListener(figure); }
});

function addViewerListener(element) {
    console.debug(`addViewerListener`, element);
    element.addEventListener('click', showViewer);
    element.style.cursor = 'zoom-in';
}

function showViewer(event) {
    const element = event.target;
    // I WISH SOMEONE TOLD ME ABOUT THE POPOVER API BEFORE I MADE THIS
    console.debug(`showViewer ${element?.tagName}`, element);
    viewer.style.display = "flex";
    viewerImage.style.display = 'none';
    viewerVideo.style.display = 'none';
    viewerCaption.innerText = element.src;

    if (element == null) return;
    setViewer(element);

    function setViewer(media) {
        if (media.tagName == 'FIGURE') {
            viewerCaption.innerText = media.querySelector('figcaption').innerText;
            setViewer(media.querySelector('img, video'));
        }

        if (media.tagName == 'IMG') {
            viewerImage.src = media.src;
            viewerImage.style.display = 'block';
            return;
        }

        if (media.tagName == 'VIDEO') {
            viewerVideo.src = media.src;
            viewerVideo.style.display = 'block';
            return;
        }
    }
}

function hideViewer() {
    console.debug(`hideViewer byebye!`);
    viewer.style.display = 'none';
    viewerImage.removeAttribute('src');
    viewerVideo.removeAttribute('src');
    viewerCaption.innerText = '';
}