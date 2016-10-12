G.WorldView = (function (Promise, Transition, CallbackCounter, wrap, UI, subtract, Image, Vectors, Math) {
    "use strict";

    function WorldView(services) {
        this.stage = services.stage;
        this.timer = services.timer;
    }

    function hasTag(name) {
        function eqName(tag) {
            return tag == name || tag instanceof Object && Object.keys(tag).some(eqName);
        }

        return function (tags) {
            return tags.some(eqName);
        };
    }

    // function getTagValue(name) {
    //     return function (tags) {
    //         var returnValue = false;
    //         tags.some(function (tag) {
    //             if (tag[name] != undefined) {
    //                 returnValue = tag[name];
    //                 return true;
    //             }
    //             return false;
    //         });
    //         return returnValue;
    //     };
    // }

    function createPlayer(stage, elem) {
        var player = createStatic(stage, elem);

        player.hand = stage.createImage(Image.HAND)
            .setPosition(wrap(elem.x), wrap(elem.y))
            .setZIndex(player.drawable.zIndex - 1);

        var xRotationOffset = elem.width / 4 * 3;
        var yOffset = 2;
        player.hand.rotationAnchorOffsetX = -xRotationOffset;
        player.hand.rotationAnchorOffsetY = -yOffset;
        // player.hand.anchorOffsetX = xRotationOffset;
        player.hand.rePosition = function () {
            player.hand.x += xRotationOffset;
            player.hand.y += yOffset;
        };

        player.forceX = 0;
        player.forceY = 0;
        return player;
    }

    function createStatic(stage, elem) {
        var imgName = elem.filename.substring(0, elem.filename.lastIndexOf('.'));

        var collision = stage.createRectangle(false)
            .setPosition(wrap(elem.x), wrap(elem.y))
            .setWidth(wrap(elem.width))
            .setHeight(wrap(elem.height));

        collision.show = false;

        collision.drawable = stage.createImage(imgName)
            .setPosition(wrap(elem.x), wrap(elem.y))
            .setZIndex(elem.zIndex);

        if (elem.tags && hasTag('aim')(elem.tags)) {
            collision.select = stage.createImage(Image.SELECT_ARROW)
                .setPosition(wrap(elem.x), wrap(elem.y - elem.height / 2 + 1))
                .setZIndex(collision.drawable.zIndex + 1);
            collision.select.rePosition = function () {
                collision.select.y = collision.drawable.y - elem.height / 2 - 2;
            };

            collision.aim = stage.createImage(elem.width <= UI.TILE_LENGTH ? Image.AIM_SMALL : Image.AIM)
                .setPosition(wrap(elem.x), wrap(elem.y))
                .setZIndex(collision.drawable.zIndex + 1);

            collision.isSelected = false;
            collision.lastSelected = 0;
        }

        return collision;
    }

    function createNPC(stage, elem) {
        return createStatic(stage, elem);
    }

    WorldView.prototype.init = function (worldData) {
        var statics = [];
        var player = null;
        var npcs = [];

        worldData.drawables.forEach(function (drawableData) {
            if (drawableData.tags && hasTag('player')(drawableData.tags)) {
                player = createPlayer(this.stage, drawableData);

            } else if (drawableData.tags && hasTag('npc')(drawableData.tags)) {
                npcs.push(createNPC(this.stage, drawableData));

            } else {
                statics.push(createStatic(this.stage, drawableData))
            }
        }, this);

        return {
            player: player,
            statics: statics,
            npcs: npcs
        };
    };

    WorldView.prototype.fadeInScene = function (entities) {
        var promise = new Promise();

        var spacing = Transition.EASE_OUT_BACK;
        var dropInSpeed = 30;

        var callbackCounter = new CallbackCounter(promise.resolve.bind(promise));

        function dropIn(pair) {
            // var later = range(1, 30);
            pair.drawable.show = false;

            // this.timer.doLater(function () {
            pair.moveFrom(wrap(pair, 'x'), subtract(wrap(pair, 'y'), wrap(UI.HEIGHT)))
                .setDuration(dropInSpeed * 2)
                .setSpacing(spacing)
                .setCallback(callbackCounter.register());
            // }, later);

            this.timer.doLater(function () {
                pair.drawable.show = true;
            }, 1);
        }

        entities.statics.forEach(dropIn, this);
        entities.npcs.forEach(dropIn, this);

        dropIn.call(this, entities.player);

        return promise;
    };

    WorldView.prototype.spawnBullet = function (shooter, target) {
        var aimingVector = Vectors.get(shooter.x, shooter.y, target.x, target.y);
        var angle = Vectors.getAngle(aimingVector.x, aimingVector.y);

        var playerWidth = shooter.getWidth();
        var startX = Math.floor(Vectors.getX(shooter.x, playerWidth, angle));
        var startY = Math.floor(Vectors.getY(shooter.y, playerWidth, angle));

        var bullet = this.stage.createABLine()
            .setA(wrap(startX), wrap(startY))
            .setB(wrap(startX), wrap(startY));
        bullet.show = false;

        bullet.drawable = this.stage.createABLine()
            .setA(wrap(startX), wrap(startY))
            .setB(wrap(startX), wrap(startY))
            .setColor(UI.GREEN_MIDDLE);

        bullet.forceX = Vectors.getX(0, 4, angle);
        bullet.forceY = Vectors.getY(0, 4, angle);

        return bullet;
    };

    WorldView.prototype.destroyEntity = function (entity) {
        var promise = new Promise();
        promise.resolve(entity);
        return promise;
    };

    WorldView.prototype.removeBullet = function (bullet) {
        var vector = Vectors.get(bullet.data.ax, bullet.data.ay, bullet.data.bx, bullet.data.by);
        var angle = Vectors.getAngle(vector.x, vector.y);

        bullet.forceX = Vectors.getX(0, 6, angle);
        bullet.forceY = Vectors.getY(0, 6, angle);
    };

    return WorldView;
})(H5.Promise, H5.Transition, H5.CallbackCounter, H5.wrap, G.UI, H5.subtract, G.Image, H5.Vectors, Math);