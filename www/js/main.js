window.onload = function () {
    "use strict";

    H5.Bootstrapper
        .keyBoard()
        .gamePad()
        .lowRez(G.UI.WIDTH, G.UI.HEIGHT)
        .responsive()
        .fullScreen()
        .build(G.MyGameResources, G.installMyScenes)
        .start();
};