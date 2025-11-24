document.addEventListener('DOMContentLoaded', function(event) {
    for (const video of document.querySelectorAll('video')) {
        console.debug('setting defaults', video);
        video.muted = true;
        video.loop = true;
        video.controls = false;
        video.disablePictureInPicture = true;
        
        video.addEventListener("abort", logVideoStats);
        //video.addEventListener("canplay", setMessage);
        //video.addEventListener("canplaythrough", setMessage);
        video.addEventListener("emptied", logVideoStats);
        video.addEventListener("ended", logVideoStats);
        video.addEventListener("error", logVideoStats);
        video.addEventListener("loadeddata", logVideoStats);
        video.addEventListener("loadedmetadata", logVideoStats);
        video.addEventListener("loadstart", logVideoStats);
        video.addEventListener("pause", logVideoStats);
        video.addEventListener("play", logVideoStats);
        video.addEventListener("playing", logVideoStats);
        video.addEventListener("progress", logVideoStats);
        video.addEventListener("stalled", logVideoStats);
        // video.addEventListener("suspend", logVideoStats);
        video.addEventListener("waiting", logVideoStats);

        function logVideoStats(event) {
            console.debug(event, this);
            if (!document.body.classList.contains('debug')) return;

            let output = this.parentElement.querySelector('output');
            if (!output) {
                output = this.parentElement.appendChild(document.createElement('output'));
                output.classList.add('overlay');
            }
            const properties = [
                "networkState",
                "readyState",
                "autoplay",
                "currentTime",
                "error",
                "loop",
                "paused",
                "seeking",
            ];

            const dl = document.createElement('dl');
            for (const property of properties) {
                const dt = dl.appendChild(document.createElement('dt'));
                dt.innerText = `${property}: `;
                const dd = dl.appendChild(document.createElement('dd'));
                dd.innerText = this[property];
            }
            output.innerHTML = `<h5>${event.type}</h5>`;
            output.appendChild(dl);
        }
    }
});

document.addEventListener('debugtoggled', function(event) {
    for (const video of document.querySelectorAll(query)) {
        video.addEventListener("abort", logVideoStats);
        //video.addEventListener("canplay", setMessage);
        //video.addEventListener("canplaythrough", setMessage);
        video.addEventListener("emptied", logVideoStats);
        video.addEventListener("ended", logVideoStats);
        video.addEventListener("error", logVideoStats);
        video.addEventListener("loadeddata", logVideoStats);
        video.addEventListener("loadedmetadata", logVideoStats);
        video.addEventListener("loadstart", logVideoStats);
        video.addEventListener("pause", logVideoStats);
        video.addEventListener("play", logVideoStats);
        video.addEventListener("playing", logVideoStats);
        video.addEventListener("progress", logVideoStats);
        video.addEventListener("stalled", logVideoStats);
        // video.addEventListener("suspend", logVideoStats);
        video.addEventListener("waiting", logVideoStats);

        function logVideoStats(event) {
            console.debug(event, this);
            if (!document.body.classList.contains('debug')) return;

            let output = this.parentElement.querySelector('output');
            if (!output) {
                output = this.parentElement.appendChild(document.createElement('output'));
                output.classList.add('overlay');
            }
            const properties = [
                "networkState",
                "readyState",
                "autoplay",
                "currentTime",
                "error",
                "loop",
                "paused",
                "seeking",
            ];

            const dl = document.createElement('dl');
            for (const property of properties) {
                const dt = dl.appendChild(document.createElement('dt'));
                dt.innerText = `${property}: `;
                const dd = dl.appendChild(document.createElement('dd'));
                dd.innerText = this[property];
            }
            output.innerHTML = `<h5>${event.type}</h5>`;
            output.appendChild(dl);
        }
    }
});