export function add_message(ctx2d, msg, color = "black") {
    ctx2d.canvas.innerHTML += `<div style="color:${color}">${msg}</div>`;

    ctx2d.font = "normal 24px sans-serif";
    ctx2d.fillStyle = color;
    ctx2d.fillText(msg, 10, 24 * ctx2d.canvas.children.length);

    console.log(msg);
}