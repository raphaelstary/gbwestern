G.installPlayerGamePad = (function (Event) {
    "use strict";

    function installPlayerGamePad(events, playerController) {
        var leftPressed = false;
        var rightPressed = false;
        var upPressed = false;
        var downPressed = false;
        var enterPressed = false;
        var escapePressed = false;

        function leftCallback() {
            if (!leftPressed)
                return;
            playerController.handleKeyLeft(leftCallback);
        }

        function rightCallback() {
            if (!rightPressed)
                return;
            playerController.handleKeyRight(rightCallback);
        }

        function upCallback() {
            if (!upPressed)
                return;
            playerController.handleKeyUp(upCallback);
        }

        function downCallback() {
            if (!downPressed)
                return;
            playerController.handleKeyDown(downCallback);
        }

        return events.subscribe(Event.GAME_PAD, function (gamePad) {
            if (gamePad.isDPadLeftPressed() && !leftPressed) {
                leftPressed = true;
                playerController.handleKeyLeft(leftCallback);
            } else if (!gamePad.isDPadLeftPressed() && leftPressed) {
                leftPressed = false;
            }

            if (gamePad.isDPadRightPressed() && !rightPressed) {
                rightPressed = true;
                playerController.handleKeyRight(rightCallback);
            } else if (!gamePad.isDPadRightPressed() && rightPressed) {
                rightPressed = false;
            }

            if (gamePad.isDPadUpPressed() && !upPressed) {
                upPressed = true;
                playerController.handleKeyUp(upCallback);
            } else if (!gamePad.isDPadUpPressed() && upPressed) {
                upPressed = false;
            }

            if (gamePad.isDPadDownPressed() && !downPressed) {
                downPressed = true;
                playerController.handleKeyDown(downCallback);
            } else if (!gamePad.isDPadDownPressed() && downPressed) {
                downPressed = false;
            }

            if (gamePad.isAPressed() && !enterPressed) {
                enterPressed = true;
                playerController.handleActionKey();
            } else if (!gamePad.isAPressed() && enterPressed) {
                enterPressed = false;
            }

            if (gamePad.isStartPressed() && !escapePressed) {
                escapePressed = true;
                playerController.handleMenuKey();
            } else if (!gamePad.isStartPressed() && escapePressed) {
                escapePressed = false;
            }
        });
    }

    return installPlayerGamePad;
})(H5.Event);