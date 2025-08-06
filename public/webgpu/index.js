function initNavLinks() {
    const navLinks = document.querySelectorAll("nav > ul > li > a");
    navLinks.forEach(
        function (currentValue) {
            addNavClicker(currentValue);
        }
    );
}

function addNavClicker(link) {
    link.addEventListener("click", function (e) {
        setMainIframe(link.href);
        //window.history.pushState(null, null, link.href);
        e.preventDefault();
    }, false);

    
}

function setMainIframe(href) {
    const iframe = document.querySelector("main > iframe");
    iframe.src = href;
}

document.addEventListener("DOMContentLoaded", initNavLinks);