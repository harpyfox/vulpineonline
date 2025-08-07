const demos = [
    "canvas",
    "triangle",
    "triangle - Copy (1)", // yeah not that dynamic
    "lab",
];

let baseTitle = document.head.querySelector("title").textContent;

// when go forward or back load the demo it thje hbgh
window.addEventListener('popstate', (e) => {
    console.log("POP STATE!!!!!!!!!!")
    e.preventDefault();
    parseURL();
});

function initNavLinks() {
    const navLinks = document.querySelector("nav > ul");

    demos.forEach(
        function (demoKey) {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = `./demos/${demoKey}/index.html`;
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
        url.searchParams.set('demo', demoKey);
        setURL(url);

        setDemo(demoKey);
    }, false);
}

function setURL(url) {
    history.pushState(null, null, url.toString());
}

function setDemo(demoKey) {
    console.log(`SETTING DEMO ${demoKey}`);
    // if (url.searchParams.get('demo') === demoKey && !force) {
    //     console.log(`ALREADY AT ${demoKey} YOU ARE FUCK`);
    //     return;
    // }
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

function getDemoLocation(demoKey) {
    if (demoKey) {
        return `./demos/${demoKey}/index.html`;
    } else {
        return '';
    }
    
}

function parseURL() {
    const url = new URL(location.toString());
    const demoKey = url.searchParams.get('demo') || '';
    console.log(`parseURL ${demoKey}`);
    setDemo(demoKey);
}

// initialise nav links
document.addEventListener("DOMContentLoaded", initNavLinks);

//when 
document.addEventListener("DOMContentLoaded", () => {
    parseURL();
});

