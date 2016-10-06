G.installPlayerKeyBoard = (function (Event, Key) {
    "use strict";

    function installPlayerKeyBoard(events, playerController) {
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

        return events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (keyBoard[Key.LEFT] && !leftPressed) {
                leftPressed = true;
                playerController.handleKeyLeft(leftCallback);
            } else if (!keyBoard[Key.LEFT] && leftPressed) {
                leftPressed = false;
            }

            if (keyBoard[Key.RIGHT] && !rightPressed) {
                rightPressed = true;
                playerController.handleKeyRight(rightCallback);
            } else if (!keyBoard[Key.RIGHT] && rightPressed) {
                rightPressed = false;
            }

            if (keyBoard[Key.UP] && !upPressed) {
                upPressed = true;
                playerController.handleKeyUp(upCallback);
            } else if (!keyBoard[Key.UP] && upPressed) {
                upPressed = false;
            }

            if (keyBoard[Key.DOWN] && !downPressed) {
                downPressed = true;
                playerController.handleKeyDown(downCallback);
            } else if (!keyBoard[Key.DOWN] && downPressed) {
                downPressed = false;
            }

            if (keyBoard[Key.ENTER] && !enterPressed) {
                enterPressed = true;
                playerController.handleActionKey();
            } else if (!keyBoard[Key.ENTER] && enterPressed) {
                enterPressed = false;
            }

            if (keyBoard[Key.ESC] && !escapePressed) {
                escapePressed = true;
                playerController.handleMenuKey();
            } else if (!keyBoard[Key.ESC] && escapePressed) {
                escapePressed = false;
            }
        });
    }

    return installPlayerKeyBoard;
})(H5.Event, H5.Key);