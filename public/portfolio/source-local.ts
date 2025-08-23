import type * as portfolio from "./portfolio.js";

async function parse(className: string): Promise<portfolio.ParsedEntry[]>  {
    const name = `source-local.parse()`;
    console.time(name);

    const parsedEntries: portfolio.ParsedEntry[] = [];
    
    const elements = document.getElementsByClassName(className);
    for (const element of elements) {
        const content = element.innerHTML;
        if (!content) {
            continue;
        }

        const entry: portfolio.Entry = {
            text: content,
            embed: null,
        };

        parsedEntries.push({ sourceElement: element, entry: entry });
    }

    console.timeEnd(name);
    return parsedEntries;
}

export { parse };