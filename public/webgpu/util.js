export function add_message(ctx2d, msg, color = "black") {
    ctx2d.canvas.innerHTML += `<div style="color:${color}">${msg}</div>`;

    ctx2d.font = "normal 24px sans-serif";
    ctx2d.fillStyle = color;
    ctx2d.fillText(msg, 10, 24 * ctx2d.canvas.children.length);
    switch (color) {
        case "red": console.error(msg); break;
        case "yellow": console.warning(msg); break;
        default: console.log(msg); break;
    }
}

export function e(id) {
    return document.getElementById(id);
}

export async function fetchShader(id) {
    const urlString = `../../shaders/${id}.wgsl`;
    console.info(`lets fetch ${urlString}`);
    try {
        const response = await fetch(urlString);
        if (!response.ok) {
            throw new Error(`fetchShader(${id}) url ${urlString}: response ${response.status}`);
        } else {
            console.info(`fetched shader from ${urlString}!`);
        }

        return await response.text();

    } catch (error) {
        console.error(`fetchShader(${id}) url ${urlString}: ${error.message}`);
    }

    return null;
}