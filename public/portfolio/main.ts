import * as bluesky from "./source-bluesky.js";
import * as local from "./source-local.js";


function createTextEntry() {

}

function createVideoEntry() {

}

function createImageEntry() {

}

async function main() {

    const entries = [];
    entries.push(await bluesky.parse(`source-bluesky`));
    entries.push(await local.parse(`source-local`));
    for (const entry of entries) {
        // [TODO]
    }

}

if (['interactive', 'complete'].indexOf(document.readyState) !== -1) {
    main();
}
else {
    document.addEventListener('DOMContentLoaded', () => main());
}