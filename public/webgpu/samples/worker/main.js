const worker = new Worker(new URL("worker.js", import.meta.url));

worker.addEventListener("message", (e) => {
    console.log(`Main: Received message from worker!\n
        command: ${e.data.command}\n
        value: ${e.data.value}`);
    document.getElementById("worker-result").textContent = e.data.value;
});

document.getElementById("postMessage").addEventListener("click", () => {
    worker.postMessage({ command: "init", value: 69 });
});