import { add_message } from "../../util.js";

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext("2d");

function main() {
    ctx.fillStyle = "gray";

    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, 900, 900);

    ctx.fillStyle = "green";
    ctx.fillRect(10, 10, 150, 100);

    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillRect(100, 100, 300, 300);

    ctx.fillStyle = "rgba(0,0,255, 0.5)";
    ctx.fillRect(250, 250, 300, 300);

    ctx.beginPath();
    ctx.moveTo(700, 500);
    ctx.lineTo(452, 170);
    ctx.lineTo(56, 512);
    ctx.arc(200, 515, 50, 0, Math.PI * 2, true);
    ctx.lineTo(273, 302);
    ctx.stroke();


    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 25;
    ctx.shadowBlur = 10;
    ctx.font = "bold 48px serif";
    ctx.strokeText("bada bing bada boom", 50, 100);

    add_message(ctx, "canvas 2D");
}


document.addEventListener("DOMContentLoaded", main);
