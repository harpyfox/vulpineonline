//#region Variables

const dir = `./samples`;
const searchParam = `sample`;
const demos = [
    "canvas",
    "triangle",
    "triangle - Copy (1)",
    "lab",
    "lab-ts",
    "worker",
    "webfun",
];

let baseTitle = document.head.querySelector("title").textContent;

//#endregion

//#region Functions

function getDemoLocation(demoKey) {
    if (demoKey) {
        return `${dir}/${demoKey}/index.html`;
    } else {
        return '';
    }

}

function initNavLinks() {
    const navLinks = document.querySelector("nav > ul");

    demos.forEach(
        function (demoKey) {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = getDemoLocation(demoKey);
            a.textContent = demoKey;
            li.appendChild(a);
            navLinks.appendChild(li);
            addNavClicker(a)
        }
    );
}

function addNavClicker(a) {
    a.addEventListener("click", function (e) {
        e.preventDefault();
        const demoKey = a.textContent;

        const url = new URL(location.toString());
        url.searchParams.set(searchParam, demoKey);
        setURL(url);

        setDemo(demoKey);
    }, false);
}

function setURL(url) {
    history.pushState(null, null, url.toString());
}

function setDemo(demoKey) {
    console.log(`SETTING DEMO ${demoKey}`);
    const demoContainer = document.querySelector("main");
    demoContainer.innerHTML = ``;
    demoContainer.innerHTML = `<iframe src="${getDemoLocation(demoKey)}"></iframe>`;

    const title = document.head.querySelector("title");

    if (demoKey) {
        title.textContent = `${baseTitle} - ${demoKey}`
    } else {
        title.textContent = baseTitle;
    }
}

function parseURL() {
    const url = new URL(location.toString());
    const demoKey = url.searchParams.get('demo') || '';
    console.log(`parseURL ${demoKey}`);
    setDemo(demoKey);
}

//#endregion

//#region Sideeffects

window.addEventListener('popstate', (e) => {
    e.preventDefault();
    parseURL();
});

document.addEventListener("DOMContentLoaded", () => {
    initNavLinks();
    parseURL();
});

//#endregion
