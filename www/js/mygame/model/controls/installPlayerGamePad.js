G.installPlayerGamePad = (function (Event) {
    "use strict";

    function installPlayerGamePad(events, playerController) {
        var leftPressed = false;
        var rightPressed = false;
        var upPressed = false;
        var downPressed = false;
        var actionPressed = false;
        var altActionPressed = false;
        var menuPressed = false;

        return events.subscribe(Event.GAME_PAD, function (gamePad) {
            if (gamePad.isDPadLeftPressed() && !leftPressed) {
                leftPressed = true;
                playerController.handleLeftKeyDown();
            } else if (!gamePad.isDPadLeftPressed() && leftPressed) {
                leftPressed = false;
                playerController.handleLeftKeyUp();
            }

            if (gamePad.isDPadRightPressed() && !rightPressed) {
                rightPressed = true;
                playerController.handleRightKeyDown();
            } else if (!gamePad.isDPadRightPressed() && rightPressed) {
                rightPressed = false;
                playerController.handleRightKeyUp();
            }

            if (gamePad.isDPadUpPressed() && !upPressed) {
                upPressed = true;
                playerController.handleUpKeyDown();
            } else if (!gamePad.isDPadUpPressed() && upPressed) {
                upPressed = false;
                playerController.handleUpKeyUp();
            }

            if (gamePad.isDPadDownPressed() && !downPressed) {
                downPressed = true;
                playerController.handleDownKeyDown();
            } else if (!gamePad.isDPadDownPressed() && downPressed) {
                downPressed = false;
                playerController.handleDownKeyUp();
            }

            if (gamePad.isAPressed() && !actionPressed) {
                actionPressed = true;
                playerController.handleActionKey();
            } else if (!gamePad.isAPressed() && actionPressed) {
                actionPressed = false;
            }

            var isAltActionKey = gamePad.isBPressed() || gamePad.isXPressed();
            if (isAltActionKey && !altActionPressed) {
                altActionPressed = true;
                playerController.handleAltActionKey();
            } else if (!isAltActionKey && altActionPressed) {
                altActionPressed = false;
            }

            if (gamePad.isStartPressed() && !menuPressed) {
                menuPressed = true;
                playerController.handleMenuKey();
            } else if (!gamePad.isStartPressed() && menuPressed) {
                menuPressed = false;
            }
        });
    }

    return installPlayerGamePad;
})(H5.Event);