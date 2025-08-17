class HTMLAppleElement extends HTMLElement {
    static tag = "apple";
    static observedAttributes =["type"];

    constructor() {
        super();
    }
}

customElements.define(HTMLAppleElement.tag, HTMLAppleElement);