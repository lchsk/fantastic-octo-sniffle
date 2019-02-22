const Codes = {
    TAB: 9,
    ENTER: 13,
    LEFT_SHIFT: 16,
    LEFT_CONTROL: 17,
    LEFT_ALT: 18,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    A: 65,
    C: 67,
    D: 68,
    S: 85,
    X: 88,
    Z: 90,
};

class Keys {
    constructor() {
        // Make it a static variable when it's possible
        this.codes = Codes;

        this._pressed = {};
    }

    isDown(keyCode) {
        return this._pressed[keyCode];
    }

    isUp(keyCode) {
        if (this._pressed[keyCode]) {
            delete this._pressed[keyCode];

            return true;
        }

        return false;
    }

    onKeyUp(event) {
        delete this._pressed[event.keyCode];
    }

    onKeyDown(event) {
        this._pressed[event.keyCode] = true;
    }
}

export { Keys };
