G.WorldView = (function (Promise, Transition, CallbackCounter, wrap, UI, subtract, Image, Vectors, Math, Object,
    NPCState) {
    "use strict";

    function WorldView(services, barrel, cards) {
        this.stage = services.stage;
        this.timer = services.timer;

        this.barrel = barrel;
        barrel.data = this.stage.getGraphic(Image.BULLET + 6);
        this.cards = cards;
    }

    function eqName(tag) {
        return tag == this.name || tag instanceof Object && Object.keys(tag).some(eqName.bind(this));
    }

    function hasTag(name) {
        return function (tags) {
            return tags.some(eqName.bind({name: name}));
        };
    }

    function getTagValue(name) {
        return function (tags) {
            var filtered = tags.filter(eqName.bind({name: name}));
            if (filtered.length == 0)
                return false;
            return filtered[0][name];
        }
    }

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

        player.lives = 3;

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

    function createEnemy(stage, elem) {
        var enemy = createStatic(stage, elem);
        enemy.lives = 2;
        enemy.state = NPCState.IDLE;
        enemy.shotsFired = 0;

        return enemy;
    }

    WorldView.prototype.init = function (worldData) {
        var statics = [];
        var player = null;
        var npcs = [];

        worldData.drawables.forEach(function (drawableData) {
            if (drawableData.tags && hasTag('player')(drawableData.tags)) {
                player = createPlayer(this.stage, drawableData);

            } else if (drawableData.tags && getTagValue('entity')(drawableData.tags) == 'enemy') {
                npcs.push(createEnemy(this.stage, drawableData));

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

    WorldView.prototype.spinRevolver = function (bulletsLoaded) {
        var promise = new Promise();
        var self = this;
        this.barrel.animate(Image[Image.BARREL_SHOT + bulletsLoaded], Image.BARREL_SHOT_FRAMES, false)
            .setCallback(function () {
                self.barrel.data = self.stage.getGraphic(Image.BULLET + --bulletsLoaded);
                promise.resolve();
            });
        return promise;
    };

    WorldView.prototype.reloadRevolver = function () {
        var promise = new Promise();
        var self = this;
        this.barrel.animate(Image.BARREL_RELOAD, Image.BARREL_RELOAD_FRAMES, false)
            .setCallback(function () {
                self.barrel.data = self.stage.getGraphic(Image.BULLET + 6);
                promise.resolve();
            });
        return promise;
    };

    return WorldView;
})(H5.Promise, H5.Transition, H5.CallbackCounter, H5.wrap, G.UI, H5.subtract, G.Image, H5.Vectors, Math, Object,
    G.NPCState);