G.Game = (function (Event, installPlayerGamePad, installPlayerKeyBoard, createWorld, Key, Button, PlayerControls) {
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

        var wrapper = createWorld(this.services, this.barrel, {
            heart: this.cardHeart,
            diamond: this.cardDiamond,
            spade: this.cardSpade,
            club: this.cardSpade
        }, gameOver);

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

        var ctrl = this.controller;
        var keyBoard = this.keyBoard = PlayerControls.getKeyBoard();
        keyBoard.add(Key.LEFT).onDown(ctrl.handleLeftKeyDown.bind(ctrl)).onUp(ctrl.handleLeftKeyUp.bind(ctrl));
        keyBoard.add(Key.RIGHT).onDown(ctrl.handleRightKeyDown.bind(ctrl)).onUp(ctrl.handleRightKeyUp.bind(ctrl));
        keyBoard.add(Key.UP).onDown(ctrl.handleUpKeyDown.bind(ctrl)).onUp(ctrl.handleUpKeyUp.bind(ctrl));
        keyBoard.add(Key.DOWN).onDown(ctrl.handleDownKeyDown.bind(ctrl)).onUp(ctrl.handleDownKeyUp.bind(ctrl));
        keyBoard.add(Key.ENTER).or(Key.CTRL).onDown(ctrl.handleActionKey.bind(ctrl));
        keyBoard.add(Key.SPACE).or(Key.ALT).onDown(ctrl.handleAltActionKey.bind(ctrl));
        keyBoard.add(Key.ESC).onDown(ctrl.handleMenuKey.bind(ctrl));
        keyBoard.register(this.events);

        var gamePad = this.gamePad = PlayerControls.getGamePad();
        gamePad.add(Button.D_PAD_LEFT).onDown(ctrl.handleLeftKeyDown.bind(ctrl)).onUp(ctrl.handleLeftKeyUp.bind(ctrl));
        gamePad.add(Button.D_PAD_RIGHT).onDown(ctrl.handleRightKeyDown.bind(ctrl))
            .onUp(ctrl.handleRightKeyUp.bind(ctrl));
        gamePad.add(Button.D_PAD_UP).onDown(ctrl.handleUpKeyDown.bind(ctrl)).onUp(ctrl.handleUpKeyUp.bind(ctrl));
        gamePad.add(Button.D_PAD_DOWN).onDown(ctrl.handleDownKeyDown.bind(ctrl)).onUp(ctrl.handleDownKeyUp.bind(ctrl));
        gamePad.add(Button.A).onDown(ctrl.handleActionKey.bind(ctrl));
        gamePad.add(Button.B).or(Button.X).onDown(ctrl.handleAltActionKey.bind(ctrl));
        gamePad.add(Button.START).onDown(ctrl.handleMenuKey.bind(ctrl));
        gamePad.register(this.events);

        this.controls = this.events.subscribe(Event.TICK_POST_INPUT, this.controller.update.bind(this.controller));

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
        this.keyBoard.cancel();
        this.gamePad.cancel();
        this.events.unsubscribe(this.controls);

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
})(H5.Event, G.installPlayerGamePad, G.installPlayerKeyBoard, G.createWorld, H5.Key, H5.GamePadButton,
    H5.PlayerControls);