G.PlayerController = (function () {
    "use strict";

    function PlayerController(player, world) {
        this.player = player;
        this.world = world;

        this.__paused = false;

        this.__leftPressed = false;
        this.__rightPressed = false;
        this.__downPressed = false;
        this.__upPressed = false;

        this.__shooting = false;
    }

    PlayerController.prototype.update = function () {
        if (this.__leftPressed) {
            this.handleLeftKey();
        }
        if (this.__rightPressed) {
            this.handleRightKey();
        }
        if (this.__downPressed) {
            this.handleDownKey();
        }
        if (this.__upPressed) {
            this.handleUpKey();
        }
    };

    PlayerController.prototype.handleLeftKeyDown = function () {
        this.__leftPressed = true;
    };

    PlayerController.prototype.handleRightKeyDown = function () {
        this.__rightPressed = true;
    };

    PlayerController.prototype.handleUpKeyDown = function () {
        this.__upPressed = true;
    };

    PlayerController.prototype.handleDownKeyDown = function () {
        this.__downPressed = true;
    };

    PlayerController.prototype.handleLeftKeyUp = function () {
        this.__leftPressed = false;
    };

    PlayerController.prototype.handleRightKeyUp = function () {
        this.__rightPressed = false;
    };

    PlayerController.prototype.handleUpKeyUp = function () {
        this.__upPressed = false;
    };

    PlayerController.prototype.handleDownKeyUp = function () {
        this.__downPressed = false;
    };

    PlayerController.prototype.pause = function () {
        this.__paused = true;
    };

    PlayerController.prototype.resume = function () {
        this.__paused = false;
    };

    var FORCE_X = 0.2;
    var FORCE_Y = 0.2;

    PlayerController.prototype.handleLeftKey = function () {
        if (this.__paused)
            return;

        this.player.forceX -= FORCE_X;
    };

    PlayerController.prototype.handleRightKey = function () {
        if (this.__paused)
            return;

        this.player.forceX += FORCE_X;
    };

    PlayerController.prototype.handleUpKey = function () {
        if (this.__paused)
            return;

        this.player.forceY -= FORCE_Y;
    };

    PlayerController.prototype.handleDownKey = function () {
        if (this.__paused)
            return;

        this.player.forceY += FORCE_Y;
    };

    PlayerController.prototype.handleActionKey = function () {
        if (this.__paused)
            return;
        if (this.__shooting)
            return;

        this.__shooting = true;
        this.world.shoot().then(function () {
            this.__shooting = false;
        }, this);
    };

    PlayerController.prototype.handleAltActionKey = function () {
        if (this.__paused)
            return;

        this.world.selectTarget();
    };

    PlayerController.prototype.handleMenuKey = function () {
        // if (this.__paused)
        //     return;

        // open menu
    };

    return PlayerController;
})();