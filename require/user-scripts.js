class UserScripts {

    constructor() {
        /**
         * JavaScript Class' natively return themselves, we can take advantage
         * of this to prevent duplicate setup calls from overwriting the global
         * reference to this class.
         *
         * We need to do this since we are explicitly trying to keep a global
         * reference on window. If we did not do this a developer could accidentally
         * assign to window.UserScript again overwriting the class.
         */
        if (window.UserScript) {
            // eslint-disable-next-line no-constructor-return
            return window.UserScript;
        }
        // eslint-disable-next-line no-constructor-return
        return this;
    }

    addScript(url, options = {doc: document, executed: '', footer: false, type: ''}) {
        const link = document.createElement('script');
        link.src = url;
        if (options.executed === 'defer') {
            link.setAttribute('defer', '');
        } else if (options.executed === 'async') {
            link.setAttribute('async', '');
        }
        if (options.type) {
            link.setAttribute('type', options.type);
        }
        if (options.footer) {
            options.doc.getElementsByTagName('body')[0].appendChild(link);
            return;
        }
        options.doc.getElementsByTagName('head')[0].appendChild(link);
    }

    addStylesheet(url, options = {doc: document, media: 'screen,print'}) {
        const link = document.createElement('LINK');
        link.href = url;
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.media = options.media;
        options.doc.getElementsByTagName('head')[0].appendChild(link);
    }

    /**
     * A helper function that simplifies some of the aspects of creating a new
     * element to attach to the DOM. This will allow you to write less code in
     * your scripts when you need to create new elements.
     * 
     * @param {string} tag     The tagName to create.
     * @param {object} options A special options object that can be used to pass in the elements
     *                         innerHTML, listeners, classes, ids, and so on.
     * 
     * @returns The created element.
     */
    createElement(tag, options = {}) {
        const attrs = options.attrs;
        const classes = options.classes;
        const id = options.id;
        const innerHTML = options.innerHTML;
        const listeners = options.listeners;
        let elem = document.createElement(tag);
        if (attrs) {
            if (this.isObject(attrs)) {
                Object.keys(attrs).forEach((attr) => {
                    elem.setAttribute(attr, attrs[attr]);
                });
            }
        }
        if (classes) {
            const tokens = classes.replace(/,/g, ' ').replace(/\s\s+/g).trim();
            tokens.split(' ').forEach((token) => {
                elem.classList.add(token);
            });
        }
        if (id) {
            elem.id = id;
        }
        if (innerHTML) {
            elem.innerHTML = innerHTML;
        }
        if (listeners) {
            if (Array.isArray(listeners)) {
                listeners.forEach((listener) => {
                    elem.addEventListener(listener[0], listener[1]);
                });
            }
        }
        return elem;
    }

    isObject(check) {
        if (typeof check === 'object' && !Array.isArray(check) && check !== null) {
            return true;
        }
        return false
    }

}

const UserScript = new UserScripts();
window.UserScript = UserScript;