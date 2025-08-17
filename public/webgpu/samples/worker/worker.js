//#region Side Effects

addEventListener("message", (e) => {
    console.log(`Worker: Received message from main!\n
        command: ${e.data.command}\n
        value: ${e.data.value}`);

    switch (e.data.command) {
        case "init":
            // dodood
            postMessage({ command: "none", value: `main sent me a message saying ${e.data.value}`});
            break;
    }
})

//#endregion