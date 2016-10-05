G.installMyScenes = (function (Scenes, Scene, MVVMScene, Start) {
    "use strict";

    function installMyScenes(services) {
        // create your scenes and add them to the scene manager

        var scenes = new Scenes();

        var start = new Start(services);
        var startScene = new MVVMScene(services, services.scenes[Scene.START], start, Scene.START);

        scenes.add(startScene.show.bind(startScene));

        return scenes;
    }

    return installMyScenes;
})(H5.Scenes, G.Scene, H5.MVVMScene, G.Start);