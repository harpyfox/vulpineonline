function showViewer(event) {
    const element = event.target;
    const handlingElement = event.currentTarget;
    console.debug(`showViewer ${handlingElement?.tagName}`, event);
    handlingElement.togglePopover()
}

document.addEventListener('DOMContentLoaded', (event) => {
    queries = [
        'article > img',
        'article > video',
        'figure:not(#viewer)'
    ];
    for (const query of queries) {
        for (const element of document.querySelectorAll(query)) {
            element.addEventListener('click', showViewer);
            element.setAttribute("popover", "auto");
        }
    }
});