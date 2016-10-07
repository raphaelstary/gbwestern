G.World = (function (Math, Vectors) {
    "use strict";

    function World(view, camera, shaker, entities) {
        this.view = view;
        this.camera = camera;
        this.shaker = shaker;

        this.player = entities.player;
        this.statics = entities.statics;
        this.npcs = entities.npcs;

        this.__isAiming = false;
    }

    World.prototype.updateCamera = function () {
        this.camera.move(this.player);

        this.__updatePosition(this.player);
        this.statics.forEach(this.__updatePosition, this);
        this.npcs.forEach(this.__updatePosition, this);
    };

    World.prototype.__updatePosition = function (entity) {
        this.camera.calcScreenPosition(entity, entity.drawable);
    };

    var airResistance = 0.8;

    World.prototype.updatePlayer = function () {
        var player = this.player;

        var forceX = 0;
        var forceY = 0;

        player.forceX *= airResistance;
        player.forceY *= airResistance;

        forceX += player.forceX;
        forceY += player.forceY;

        player.lastX = player.x;
        player.lastY = player.y;

        forceX = Math.round(forceX);
        forceY = Math.round(forceY);

        player.lastTotalForceX = forceX;
        player.lastTotalForceY = forceY;

        this.__setPlayerX(player.x + forceX);
        this.__setPlayerY(player.y + forceY);

        if ((forceX != 0 || forceY != 0) && !this.__isAiming)
            this.player.drawable.setRotation(Vectors.getAngle(forceX, forceY) + Vectors.toRadians(90));
    };

    World.prototype.__setPlayerX = function (x) {
        this.player.x = x;
    };

    World.prototype.__setPlayerY = function (y) {
        this.player.y = y;
    };

    World.prototype.updateNPCs = function () {

    };

    World.prototype.updateBullets = function () {

    };

    World.prototype.checkStaticCollisions = function () {

    };

    World.prototype.checkDynamicCollisions = function () {

    };

    World.prototype.checkBulletCollisions = function () {

    };

    function remove(entity) {
        entity.remove();
        entity.drawable.remove();
    }

    World.prototype.preDestroy = function () {
        this.statics.forEach(remove);
        this.npcs.forEach(remove);
        remove(this.player);
    };

    return World;
})(Math, H5.Vectors);