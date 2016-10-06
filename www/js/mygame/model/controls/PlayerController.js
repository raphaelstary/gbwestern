G.PlayerController = (function () {
    "use strict";

    function PlayerController(player, world) {
        this.player = player;
        this.world = world;

        this.__paused = false;
    }

    PlayerController.prototype.pause = function () {
        this.__paused = true;
    };

    PlayerController.prototype.resume = function () {
        this.__paused = false;
    };

    PlayerController.prototype.handleKeyLeft = function () {
        // if (this.__paused)
        //     return;

        // move left
    };

    PlayerController.prototype.handleKeyRight = function () {
        // if (this.__paused)
        //     return;

        // move right
    };

    PlayerController.prototype.handleKeyUp = function () {
        // if (this.__paused)
        //     return;

        // move top
    };

    PlayerController.prototype.handleKeyDown = function () {
        // if (this.__paused)
        //     return;

        // move down
    };

    PlayerController.prototype.handleActionKey = function () {
        // if (this.__paused)
        //     return;

        // shoot
    };

    PlayerController.prototype.handleSecondaryKey = function () {
        // if (this.__paused)
        //     return;

        // aim / select
    };

    PlayerController.prototype.handleMenuKey = function () {
        // if (this.__paused)
        //     return;

        // open menu
    };

    return PlayerController;
})();