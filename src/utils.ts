import { readdir } from "node:fs";

export function buildIndex(path: string): string {

    const directoryFiles: string[] = [];
    readdir(path, (error, files) => {
        if (error) {
            directoryFiles.push("fs.readdir failed to execute");
        } else {
            for (const file of files) {
                directoryFiles.push(file);
            }
        }
    });
    
    const html = 
    `<!DOCTYPE html>
    <html>
        <body>
            <h1>index of ${path}</h1>
            <ul>
                ${directoryFiles.map(file => `<li>${file}</li>`).join("")}
            </ul>
        </body>
    </html>`;

    console.log(`buildIndex(${path}): ${html}`);

    return html;
}