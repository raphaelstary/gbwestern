G.installPlayerKeyBoard = (function (Event, Key) {
    "use strict";

    function installPlayerKeyBoard(events, playerController) {
        var leftPressed = false;
        var rightPressed = false;
        var upPressed = false;
        var downPressed = false;
        var actionPressed = false;
        var altActionPressed = false;
        var menuPressed = false;

        return events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (keyBoard[Key.LEFT] && !leftPressed) {
                leftPressed = true;
                playerController.handleLeftKeyDown();
            } else if (!keyBoard[Key.LEFT] && leftPressed) {
                leftPressed = false;
                playerController.handleLeftKeyUp();
            }

            if (keyBoard[Key.RIGHT] && !rightPressed) {
                rightPressed = true;
                playerController.handleRightKeyDown();
            } else if (!keyBoard[Key.RIGHT] && rightPressed) {
                rightPressed = false;
                playerController.handleRightKeyUp();
            }

            if (keyBoard[Key.UP] && !upPressed) {
                upPressed = true;
                playerController.handleUpKeyDown();
            } else if (!keyBoard[Key.UP] && upPressed) {
                upPressed = false;
                playerController.handleUpKeyUp();
            }

            if (keyBoard[Key.DOWN] && !downPressed) {
                downPressed = true;
                playerController.handleDownKeyDown();
            } else if (!keyBoard[Key.DOWN] && downPressed) {
                downPressed = false;
                playerController.handleDownKeyUp();
            }

            var isActionKey = keyBoard[Key.ENTER] || keyBoard[Key.CTRL];
            if (isActionKey && !actionPressed) {
                actionPressed = true;
                playerController.handleActionKey();
            } else if (!isActionKey && actionPressed) {
                actionPressed = false;
            }

            var isAltActionKey = keyBoard[Key.SPACE] || keyBoard[Key.ALT];
            if (isAltActionKey && !altActionPressed) {
                altActionPressed = true;
                playerController.handleAltActionKey();
            } else if (!isAltActionKey && altActionPressed) {
                altActionPressed = false;
            }

            if (keyBoard[Key.ESC] && !menuPressed) {
                menuPressed = true;
                playerController.handleMenuKey();
            } else if (!keyBoard[Key.ESC] && menuPressed) {
                menuPressed = false;
            }
        });
    }

    return installPlayerKeyBoard;
})(H5.Event, H5.Key);