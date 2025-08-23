async function parse(className) {
    const name = `source-local.parse()`;
    console.time(name);
    const parsedEntries = [];
    const elements = document.getElementsByClassName(className);
    for (const element of elements) {
        const content = element.innerHTML;
        if (!content) {
            continue;
        }
        const entry = {
            text: content,
            embed: null,
        };
        parsedEntries.push({ sourceElement: element, entry: entry });
    }
    console.timeEnd(name);
    return parsedEntries;
}
export { parse };
