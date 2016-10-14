G.World = (function (Math, Vectors, Promise, NPCState, UI) {
    "use strict";

    function World(view, camera, shaker, entities) {
        this.view = view;
        this.camera = camera;
        this.shaker = shaker;

        this.player = entities.player;
        this.statics = entities.statics;
        this.npcs = entities.npcs;

        this.bullets = [];

        this.__isAiming = false;
        this.__lockHand = 0;

        this.__bulletsLoadedCount = 6;
    }

    World.prototype.updateCamera = function () {
        this.camera.move(this.player);

        this.__updatePosition(this.player);
        this.statics.forEach(this.__updatePosition, this);
        this.npcs.forEach(this.__updatePosition, this);

        this.bullets.forEach(this.__updateBulletPosition, this);
    };

    World.prototype.__updateBulletPosition = function (bullet) {
        this.camera.calcBulletsScreenPosition(bullet, bullet.drawable);
    };

    World.prototype.__updatePosition = function (entity) {
        this.camera.calcScreenPosition(entity, entity.drawable);

        if (!entity.drawable.show && entity.isSelected) {
            this.__isAiming = false;
            entity.isSelected = false;
        }

        if (entity.isSelected) {
            entity.select.show = false;
            this.camera.calcScreenPosition(entity, entity.aim);

        } else if (entity.isSelected === false) {
            entity.aim.show = false;
            this.camera.calcScreenPosition(entity, entity.select);
            entity.select.rePosition();
        }

        if (entity.hand) {
            if (this.__isAiming) {
                this.camera.calcScreenPosition(entity, entity.hand);
                entity.hand.rePosition();
            } else if (this.__lockHand > 0) {
                this.__lockHand--;
            } else {
                entity.hand.show = false;
            }
        }
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
            player.drawable.setRotation(Vectors.getAngle(forceX, forceY) + Vectors.toRadians(90));

        if (this.__isAiming) {
            var target = this.statics.concat(this.npcs).filter(isSelected)[0];
            var aimingVector = Vectors.get(player.x, player.y, target.x, target.y);
            var angle = Vectors.getAngle(aimingVector.x, aimingVector.y);
            player.hand.setRotation(angle);
            player.drawable.setRotation(angle + Vectors.toRadians(90));
        }
    };

    World.prototype.__setPlayerX = function (x) {
        this.player.x = x;
    };

    World.prototype.__setPlayerY = function (y) {
        this.player.y = y;
    };

    function isIdle(entity) {
        return entity.state == NPCState.IDLE;
    }

    function isShooting(entity) {
        return entity.state == NPCState.SHOOTING;
    }

    World.prototype.__shoot = function (entity) {
        this.bullets.push(this.view.spawnBullet(entity, this.player));
        entity.shotsFired++;
        entity.coolDown = entity.shotsFired % 6 != 0 ? 60 : 60 * 3;
    };

    World.prototype.__checkSight = function (entity) {
        var vector = Vectors.get(entity.x, entity.y, this.player.x, this.player.y);
        var magnitude = Vectors.squaredMagnitude(vector.x, vector.y);
        if (magnitude < UI.HEIGHT * UI.HEIGHT) {
            entity.state = NPCState.SHOOTING;
            this.__shoot(entity);
        }
    };

    function coolDown(entity) {
        if (entity.coolDown > 0)
            entity.coolDown--;
    }

    function isCooledDown(entity) {
        return entity.coolDown == 0;
    }

    World.prototype.updateNPCs = function () {
        this.npcs.forEach(coolDown);
        this.npcs.filter(isShooting).filter(isCooledDown).forEach(this.__shoot, this);
        this.npcs.filter(isIdle).forEach(this.__checkSight, this);
    };

    World.prototype.updateBullets = function () {
        this.bullets.forEach(this.__updateBullet, this);
    };

    World.prototype.__updateBullet = function (bullet, id, array) {
        if (bullet.dead) {
            bullet.lastAX = bullet.data.ax;
            bullet.lastAY = bullet.data.ay;
            bullet.data.ax += bullet.forceX;
            bullet.data.ay += bullet.forceY;

            var vector = Vectors.get(bullet.data.ax, bullet.data.ay, bullet.data.bx, bullet.data.by);
            var magnitude = Vectors.squaredMagnitude(vector.x, vector.y);
            if (magnitude < 10) {
                array.splice(id, 1);
                remove(bullet);
            }

            return;
        }

        bullet.lastBX = bullet.data.bx;
        bullet.lastBY = bullet.data.by;
        bullet.data.bx += bullet.forceX;
        bullet.data.by += bullet.forceY;
    };

    World.prototype.__checkCollision = function (element) {
        var player = this.player;

        var widthHalf = player.getWidthHalf();
        var heightHalf = player.getHeightHalf();
        if (player.x + widthHalf > element.getCornerX() && player.x - widthHalf < element.getEndX() &&
            player.y + heightHalf > element.getCornerY() && player.y - heightHalf < element.getEndY()) {

            var elemHeightHalf = element.getHeightHalf();
            var elemWidthHalf = element.getWidthHalf();
            var b4_y = element.y + elemHeightHalf;
            var b1_y = element.y - elemHeightHalf;
            var b4_x = element.x - elemWidthHalf;
            var b1_x = b4_x;
            var b2_x = element.x + elemWidthHalf;
            var b3_x = b2_x;
            var b2_y = b1_y;
            var b3_y = b4_y;

            var p;

            // Now compare them to know the side of collision
            if (player.lastX + widthHalf <= element.x - elemWidthHalf &&
                player.x + widthHalf > element.x - elemWidthHalf) {

                // Collision on right side of player
                p = Vectors.getIntersectionPoint(player.lastX + widthHalf, player.lastY, player.x + widthHalf, player.y,
                    b1_x, b1_y, b4_x, b4_y);
                this.__setPlayerX(p.x - widthHalf);

            } else if (player.lastX - widthHalf >= element.x + elemWidthHalf &&
                player.x - widthHalf < element.x + elemWidthHalf) {

                // Collision on left side of player
                p = Vectors.getIntersectionPoint(player.lastX - widthHalf, player.lastY, player.x - widthHalf, player.y,
                    b2_x, b2_y, b3_x, b3_y);
                this.__setPlayerX(p.x + widthHalf);

            } else if (player.lastY + heightHalf <= element.y - elemHeightHalf &&
                player.y + heightHalf > element.y - elemHeightHalf) {

                // Collision on bottom side of player
                p = Vectors.getIntersectionPoint(player.lastX, player.lastY + heightHalf, player.x,
                    player.y + heightHalf, b1_x, b1_y, b2_x, b2_y);
                this.__setPlayerY(p.y - heightHalf);

            } else {
                // Collision on top side of player
                p = Vectors.getIntersectionPoint(player.lastX, player.lastY - heightHalf, player.x,
                    player.y - heightHalf, b3_x, b3_y, b4_x, b4_y);
                this.__setPlayerY(p.y + heightHalf);
            }
        }
    };

    World.prototype.checkStaticCollisions = function () {
        this.statics.forEach(this.__checkCollision, this);
    };

    World.prototype.checkDynamicCollisions = function () {

    };

    World.prototype.checkBulletCollisions = function () {
        this.bullets.forEach(this.__checkBulletCollision, this);
    };

    World.prototype.__checkBulletCollision = function (bullet) {
        if (bullet.dead)
            return;

        this.npcs.forEach(function (npc, npcId, npcs) {
            if (isCollision(bullet.data.bx, bullet.data.by, npc)) {
                bullet.dead = true;

                if (--npc.lives < 1) {
                    this.view.destroyEntity(npc).then(function () {
                        npcs.splice(npcId, 1);
                        remove(npc);
                    }, this);

                    this.__lockHand = 15;
                    this.__isAiming = false;
                }

                this.view.removeBullet(bullet);
            }
        }, this);

        this.statics.forEach(function (staticElement, sId, statics) {
            if (isSelectable(staticElement) && isCollision(bullet.data.bx, bullet.data.by, staticElement)) {
                bullet.dead = true;
                this.view.destroyEntity(staticElement).then(function () {
                    statics.splice(sId, 1);
                    remove(staticElement);
                });
                this.view.removeBullet(bullet);
                this.__lockHand = 15;
                this.__isAiming = false;

            } else if (isCollision(bullet.data.bx, bullet.data.by, staticElement)) {
                bullet.dead = true;
                this.view.removeBullet(bullet);
            }
        }, this);
    };

    function isCollision(x, y, entity) {
        return !(x > entity.getEndX() || x < entity.getCornerX() || y < entity.getCornerY() || y > entity.getEndY());
    }

    function isVisible(entity) {
        return entity.drawable.show;
    }

    function isSelectable(entity) {
        return entity.aim;
    }

    function isSelected(entity) {
        return entity.isSelected;
    }

    function isNotSelected(entity) {
        return !entity.isSelected;
    }

    function deselect(entity) {
        entity.isSelected = false;
    }

    function select(entity) {
        entity.lastSelected = Date.now();
        return entity.isSelected = true;
    }

    function byMs(a, b) {
        return a.lastSelected - b.lastSelected;
    }

    World.prototype.selectTarget = function () {
        var targets = this.statics.concat(this.npcs).filter(isVisible).filter(isSelectable);

        if (this.__isAiming) {
            var selectedTargets = targets.filter(isSelected);
            var notSelectedTargets = targets.filter(isNotSelected).sort(byMs);

            selectedTargets.forEach(deselect);
            this.__isAiming = notSelectedTargets.some(select);

        } else {
            this.__isAiming = targets.sort(byMs).some(select);
        }
    };

    World.prototype.shoot = function () {
        var promise = new Promise();
        if (this.__isAiming) {
            var player = this.player;
            var target = this.statics.concat(this.npcs).filter(isSelected)[0];
            this.bullets.push(this.view.spawnBullet(player, target));

            this.view.spinRevolver(this.__bulletsLoadedCount--)
                .then(this.__reload.bind(this))
                .then(promise.resolve.bind(promise));
        } else {
            promise.resolve();
        }
        return promise;
    };

    World.prototype.__reload = function () {
        var promise = new Promise();
        if (this.__bulletsLoadedCount == 0) {
            this.__bulletsLoadedCount = 6;
            this.view.reloadRevolver().then(promise.resolve.bind(promise));
        } else {
            promise.resolve();
        }
        return promise;
    };

    function remove(entity) {
        if (entity.aim)
            entity.aim.remove();
        if (entity.select)
            entity.select.remove();
        if (entity.hand)
            entity.hand.remove();
        entity.remove();
        entity.drawable.remove();
    }

    World.prototype.preDestroy = function () {
        this.statics.forEach(remove);
        this.npcs.forEach(remove);
        remove(this.player);
    };

    return World;
})(Math, H5.Vectors, H5.Promise, G.NPCState, G.UI);