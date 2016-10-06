G.World = (function () {
    "use strict";

    function World(view, camera, shaker, entities) {
        this.view = view;
        this.camera = camera;
        this.shaker = shaker;

        this.player = entities.player;
        this.statics = entities.statics;
        this.npcs = entities.npcs;
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

    World.prototype.updatePlayer = function () {

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

    World.prototype.preDestroy = function () {

    };

    return World;
})();