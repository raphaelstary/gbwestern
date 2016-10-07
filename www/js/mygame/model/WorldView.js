G.WorldView = (function (Promise, Transition, CallbackCounter, wrap, UI, subtract) {
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

    return WorldView;
})(H5.Promise, H5.Transition, H5.CallbackCounter, H5.wrap, G.UI, H5.subtract);