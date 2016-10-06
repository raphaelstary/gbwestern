G.Game = (function (Event, installPlayerGamePad, installPlayerKeyBoard, createWorld) {
    "use strict";

    function Game(services) {
        this.timer = services.timer;
        this.events = services.events;

        this.services = services;
    }

    Game.prototype.postConstruct = function () {
        var isOver = false;
        var self = this;

        function gameOver() {
            if (isOver)
                return;
            isOver = true;

            self.timer.doLater(self.nextScene.bind(self), 5);
        }

        var wrapper = createWorld(this.services, gameOver);

        this.world = wrapper.world;
        this.view = wrapper.view;
        this.controller = wrapper.controller;
        this.shaker = wrapper.shaker;
        this.camera = wrapper.camera;

        this.cameraTick = this.events.subscribe(Event.TICK_CAMERA, this.world.updateCamera.bind(this.world));

        wrapper.view.fadeInScene(wrapper.entities).then(this.__registerEventListeners, this);
    };

    Game.prototype.__registerEventListeners = function () {
        this.camera.unlockPosition();

        this.keyBoardControls = installPlayerKeyBoard(this.events, this.controller);
        this.gamePadControls = installPlayerGamePad(this.events, this.controller);

        this.playerMovement = this.events.subscribe(Event.TICK_MOVE, this.world.updatePlayer.bind(this.world));
        this.npcMovement = this.events.subscribe(Event.TICK_MOVE, this.world.updateNPCs.bind(this.world));
        this.bulletMovement = this.events.subscribe(Event.TICK_MOVE, this.world.updateBullets.bind(this.world));

        this.staticCollisions = this.events.subscribe(Event.TICK_COLLISION,
            this.world.checkStaticCollisions.bind(this.world));
        this.dynamicCollisions = this.events.subscribe(Event.TICK_POST_COLLISION,
            this.world.checkDynamicCollisions.bind(this.world));
        this.bulletCollisions = this.events.subscribe(Event.TICK_POST_POST_COLLISION,
            this.world.checkBulletCollisions.bind(this.world));

        this.shakeTick = this.events.subscribe(Event.TICK_MOVE, this.shaker.update.bind(this.shaker));
    };

    Game.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyBoardControls);
        this.events.unsubscribe(this.gamePadControls);

        this.events.unsubscribe(this.playerMovement);
        this.events.unsubscribe(this.npcMovement);
        this.events.unsubscribe(this.bulletMovement);
        this.events.unsubscribe(this.staticCollisions);
        this.events.unsubscribe(this.dynamicCollisions);
        this.events.unsubscribe(this.bulletCollisions);

        this.events.unsubscribe(this.cameraTick);
        this.events.unsubscribe(this.shakeTick);

        this.world.preDestroy();
    };

    return Game;
})(H5.Event, G.installPlayerGamePad, G.installPlayerKeyBoard, G.createWorld);