import * as PIXI from 'pixi.js';

import { Keys } from './keys.js';

var keys = new Keys();
var app = new PIXI.Application();
var explosion;
document.body.innerHTML = "";
document.body.appendChild(app.view);
app.view.focus();

app.stop();

var setUpControls = (() => {
    window.addEventListener('keyup', (event) => {
        keys.onKeyUp(event);
    }, false);

    window.addEventListener('keydown', (event) => {
        keys.onKeyDown(event);
    }, false);

    window.addEventListener("keydown", (e) => {
        if ([
            keys.codes.SPACE,
            keys.codes.LEFT,
            keys.codes.RIGHT,
            keys.codes.DOWN,
            keys.codes.UP,
        ].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);
})();


// const ANIMATIONS = ["Dead", "Idle", "Idle Aim", "Shoot", "Throw", "Walk", "Walk Aim"];
const ANIMATIONS = ["Climb", "Crouch", "Crouch_Aim", "Crouch_Melee", "Crouch_Shoot",
                    "Crouch_Throw", "Dead", "Happy", "Hurt", "Idle", "Idle_Aim",
                    "Jump", "Jump_Melee", "Jump_Shoot", "Jump_Throw", "Melee", "Run",
                    "Run_Shoot", "Shoot", "Throw", "Walk", "Walk_Shoot"];



const SIDES = ["back", "front", "left", "right"];

const SOLDIER_SIDE = {
    BACK: "back",
    FRONT: "front",
    LEFT: "left",
    RIGHT: "right",
};

const SOLDIER_ANIMATIONS = {
    DEAD: "Dead",
    THROW: "Throw",
    IDLE_AIM: "Idle Aim",
    IDLE: "Idle",
    SHOOT: "Shoot",
    WALK: "Walk",
    WALK_AIM: "Walk Aim",
};

const SOLDIER_STATE = {
    DEAD: "DEAD",
    THROW: "THROW",
    IDLE_AIM: "IDLE_AIM",
    IDLE: "IDLE",
    SHOOT: "SHOOT",
    WALK: "WALK",
    WALK_AIM: "WALK_AIM",
};

const ANIMATIONS_LOOP = {
    DEAD: false,
    THROW: false,
    IDLE_AIM: true,
    IDLE: true,
    SHOOT: false,
    WALK: true,
    WALK_AIM: true,
};

const ANIMATIONS_SPEED = {
    DEAD: 0.1,
    THROW: 0.2,
    IDLE_AIM: 0.08,
    IDLE: 0.08,
    SHOOT: 0.35,
    WALK: 0.14,
    WALK_AIM: 0.14,
};

const SOLDIER_AUTOMATIC_FIRE = {
    Soldier1: true,
    Soldier2: true,
    Soldier3: true,
    Soldier4: true,
};

const SOLDIER_SCALE = 0.5;
const IMAGES_PER_ANIMATION = 10;
const SOLDIERS_COUNT = 1;

class Resources {
    constructor() {
        this.loader = app.loader;
        this.loader.baseUrl = 'assets/';

        this.animations = ANIMATIONS;
        this.sides = SIDES;

        this.soldiers = [];

        for (var i = 1; i <= SOLDIERS_COUNT; i++) {
            this.soldiers.push('Soldier' + i);
        }
    }

    load() {
        for (let soldierIdx = 0; soldierIdx < this.soldiers.length; soldierIdx++) {
            for (let animationIds = 0; animationIds < this.animations.length; animationIds++) {
                const animation = this.animations[animationIds];

                for (let i = 0; i < IMAGES_PER_ANIMATION; i++) {
                    const soldier = this.soldiers[soldierIdx];
                    const filename = `${animation}__00${i}.png`;

                    this.loader.add(`${soldier}_${filename}`, `${soldier}/${filename}`);
                }
            }
        }

        this.loader.load(onAssetsLoaded);
    }
}

var resources = new Resources();
resources.load();

class Soldier {
    constructor(identifier) {
        this.identifier = identifier;
        this.automaticFire = SOLDIER_AUTOMATIC_FIRE[identifier];
        this.animation = null;
        this.state = SOLDIER_STATE.IDLE;
        this.side = SOLDIER_SIDE.RIGHT;

        this.animations = {};
    }

    init() {
        if (!this.animation) {
            const animationName = SOLDIER_ANIMATIONS[this.state];
            this.animation = new PIXI.extras.AnimatedSprite(this.animations[animationName]);
        }
    }

    turnRight() {
        this.animation.scale.set(SOLDIER_SCALE, SOLDIER_SCALE);
    }

    turnLeft() {
        this.animation.scale.set(-SOLDIER_SCALE, SOLDIER_SCALE);
    }

    setPosition(x, y) {
        this.animation.position.set(x, y);
    }

    activateAnimation() {
        const animationName = SOLDIER_ANIMATIONS[this.state];
        this.animation.textures = this.animations[animationName];

        let loop = ANIMATIONS_LOOP[this.state];

        if (this.state == SOLDIER_STATE.SHOOT && this.automaticFire) {
            loop = true;
        }

        this.animation.loop = loop;
        this.animation.animationSpeed = ANIMATIONS_SPEED[this.state];
        this.animation.anchor.set(0.5, 0.5);

        if (this.side === SOLDIER_SIDE.LEFT) {
            this.turnLeft();
        } else {
            this.turnRight();
        }

        this.animation.gotoAndPlay(0);
    }
}

function addAnimations(soldier, animation) {
    let textures = [];

    for (let i = 0; i < IMAGES_PER_ANIMATION; i++) {
        const name = `${soldier.identifier}_${animation}__00${i}.png`;
        let texture = PIXI.Texture.fromFrame(name);

        textures.push(texture);
    }

    soldier.animations[animation] = textures;
}

var soldier = new Soldier("Soldier1");

function onAssetsLoaded(loader, res) {
    for (var j = 0; j < ANIMATIONS.length; j++) {
        const animation = ANIMATIONS[j];

        addAnimations(soldier, animation);
    }

    soldier.init();
    soldier.setPosition(200, 200);
    soldier.activateAnimation();

    app.stage.addChild(soldier.animation);

    app.start();
}

const SOLDIER_WALK_SPEED = 320;

function getSoldierSpeed(delta) {
    return SOLDIER_WALK_SPEED / 1000 * delta;
}

app.ticker.add(() => {
    const delta = app.ticker.elapsedMS;

    var nextSide = null;
    var nextState = null;
    const currentState = soldier.state;

    if (keys.isDown(keys.codes.RIGHT)) {
        soldier.animation.x += getSoldierSpeed(delta);
        nextState = SOLDIER_STATE.WALK;
        nextSide = SOLDIER_SIDE.RIGHT;
    } else if (keys.isDown(keys.codes.LEFT)) {
        soldier.animation.x -= getSoldierSpeed(delta);
        nextState = SOLDIER_STATE.WALK;
        nextSide = SOLDIER_SIDE.LEFT;
    } else if (keys.isDown(keys.codes.DOWN)) {

    } else if (keys.isDown(keys.codes.UP)) {

    } else if (keys.isDown(keys.codes.SPACE)) {
        nextState = SOLDIER_STATE.SHOOT;
    } else if (keys.isDown(keys.codes.LEFT_SHIFT)) {
        nextState = SOLDIER_STATE.THROW;
    } else {
        if ((currentState === SOLDIER_STATE.SHOOT || currentState === SOLDIER_STATE.THROW) &&
            soldier.animation.currentFrame < soldier.animation.totalFrames - 1) {
        } else {
            nextState = SOLDIER_STATE.IDLE;
        }
    }

    var activateAnimation = false;

    const currentSide = soldier.side;

    if (nextState && (currentState !== nextState)) {
        soldier.state = nextState;
        activateAnimation = true;
    }

    if (nextSide && (currentSide !== nextSide)) {
        soldier.side = nextSide;
        activateAnimation = true;
    }

    if (activateAnimation) {
        soldier.activateAnimation();
    }
});

module.hot.accept();
