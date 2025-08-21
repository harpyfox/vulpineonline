async function parse(className: string) {
    // [TODO]
    const entries = [];
    const elements = document.getElementsByClassName(className);
    for (const element of elements) {
        const content = element.innerHTML;
        if (!content) {
            continue;
        }

        
        const entry = {
            type: "text",
            text: content,
        };

        entries.push(entry);


    }

    return entries;
}

export { parse };