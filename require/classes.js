/**
 * Adds a global constant class that ES6 classes can register themselves with.
 * This is useful for referencing dynamically named classes and instances
 * where you may need to instantiate different extended classes.
 *
 * NOTE: This script should be called as soon as possible, preferably before all
 * other scripts on a page.
 *
 * @class Classes
 */
class Classes {

    #classes = {};

    constructor() {
        /**
         * JavaScript Class' natively return themselves, we can take advantage
         * of this to prevent duplicate setup calls from overwriting the global
         * reference to this class.
         *
         * We need to do this since we are explicitly trying to keep a global
         * reference on window. If we did not do this a developer could accidentally
         * assign to window.Class again overwriting any classes previously registered.
         */
        if (window.Class) {
            // eslint-disable-next-line no-constructor-return
            return window.Class;
        }
        // eslint-disable-next-line no-constructor-return
        return this;
    }

    /**
     * Add a class to the global constant.
     *
     * @method
     * @param {Class} ref The class to add.
     * @return {boolean} True if ths class was successfully registered.
     */
    add(ref) {
        if (typeof ref !== 'function') {
            return false;
        }
        this.#classes[ref.prototype.constructor.name] = ref;
        return true;
    }

    /**
     * Checks if a class exists by name.
     *
     * @method
     * @param {string} name The name of the class you would like to check.
     * @return {boolean} True if this class exists, false otherwise.
     */
    exists(name) {
        if (this.#classes[name]) {
            return true;
        }
        return false;
    }

    /**
     * Retrieve a class by name.
     *
     * @method
     * @param {string} name The name of the class you would like to retrieve.
     * @return {Class|undefined} The class asked for or undefined if it was not found.
     */
    get(name) {
        return this.#classes[name];
    }

    /**
     * Instantiate a new instance of a class by reference or name.
     *
     * @method
     * @param {Class|name} name A reference to the class or the classes name.
     * @param  {...any} args Any arguments to pass to the classes constructor.
     * @returns A new instance of the class otherwise an error is thrown.
     * @throws {ReferenceError} If the class is not defined.
     */
    new(name, ...args) {
        // In case the dev passed the actual class reference.
        if (typeof name === 'function') {
            // eslint-disable-next-line new-cap
            return new (name)(...args);
        }
        if (this.exists(name)) {
            return new (this.#classes[name])(...args);
        }
        throw new ReferenceError(`${name} is not defined`);
    }

    /**
     * An alias for the add method.
     *
     * @method
     * @alias Classes.add
     */
    register(ref) {
        return this.add(ref);
    }

}

/**
 * Insure that Classes is available in the global scope as Class so other classes
 * that wish to take advantage of Classes can rely on it being present.
 *
 * NOTE: This does not violate https://www.w3schools.com/js/js_reserved.asp
 */
const Class = new Classes();
window.Class = Class;