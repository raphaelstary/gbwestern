G.Entities = (function (Vectors, NPCState, Date) {
    "use strict";

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

    function coolDown(entity) {
        if (entity.coolDown > 0)
            entity.coolDown--;
    }

    function isCooledDown(entity) {
        return entity.coolDown == 0;
    }

    function isIdle(npc) {
        return npc.state == NPCState.IDLE;
    }

    function isShooting(npc) {
        return npc.state == NPCState.SHOOTING;
    }

    function rePositionHand(shooter, target) {
        var aimingVector = Vectors.get(shooter.x, shooter.y, target.x, target.y);
        var angle = Vectors.getAngle(aimingVector.x, aimingVector.y);
        shooter.hand.setRotation(angle);
        shooter.drawable.setRotation(angle);
    }

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

    return {
        rePositionHand: rePositionHand,
        isShooting: isShooting,
        isIdle: isIdle,
        isCooledDown: isCooledDown,
        coolDown: coolDown,
        byMs: byMs,
        select: select,
        deselect: deselect,
        isNotSelected: isNotSelected,
        isSelected: isSelected,
        isSelectable: isSelectable,
        isVisible: isVisible,
        isCollision: isCollision,
        remove: remove
    }
})(H5.Vectors, G.NPCState, Date);