G.Start = (function (Event, Key, Button, Controls) {
    "use strict";

    function Start(services) {
        this.events = services.events;
    }

    Start.prototype.postConstruct = function () {
        function callback() {
            keyBoard.cancel();
            gamePad.cancel();
            this.nextScene();
        }

        var keyBoard = Controls.getKeyBoard();
        keyBoard.add(Key.ENTER).or(Key.SPACE).onDown(callback, this);
        keyBoard.register(this.events);

        var gamePad = Controls.getGamePad();
        gamePad.add(Button.A).or(Button.START).onDown(callback, this);
        gamePad.register(this.events);
    };

    return Start;
})(H5.Event, H5.Key, H5.GamePadButton, H5.PlayerControls);