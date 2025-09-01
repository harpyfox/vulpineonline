import * as portfolio from "./portfolio.js";

async function main() {
    await portfolio.build();
}

if (['interactive', 'complete'].indexOf(document.readyState) !== -1) {
    main();
}
else {
    document.addEventListener('DOMContentLoaded', () => main());
}