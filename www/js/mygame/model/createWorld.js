G.createWorld = (function (UI, WorldView, World, ScreenShaker, createViewPort, Camera, PlayerController, Scene, wrap) {
    "use strict";

    function createWorld(services, barrel, cards, gameOver) {

        var shaker = new ScreenShaker(services.device);
        var viewPort = services.stage.createRectangle(false)
            .setPosition(wrap(UI.WIDTH / 2), wrap(UI.HEIGHT / 2))
            .setWidth(wrap(UI.WIDTH))
            .setHeight(wrap(UI.HEIGHT))
            .setShow(false);

        var worldData = services.scenes[Scene.WORLD];
        var maxCameraPosition = {
            x: worldData.screen.width - UI.WIDTH / 2,
            y: worldData.screen.height - UI.HEIGHT / 2
        };
        var camera = new Camera(viewPort, maxCameraPosition.x, maxCameraPosition.y);

        shaker.add(viewPort);

        var view = new WorldView(services, barrel, cards);
        var entities = view.init(worldData);
        var world = new World(view, camera, shaker, entities, gameOver);

        var playerController = new PlayerController(entities.player, world);

        // adjust camera
        camera.move(entities.player);
        camera.lockPosition();
        camera.hideDrawables();
        world.updateCamera();
        services.timer.doLater(function () {
            camera.showDrawables();
        }, 1);

        return {
            world: world,
            view: view,
            controller: playerController,
            shaker: shaker,
            camera: camera,
            entities: entities
        };
    }

    return createWorld;
})(G.UI, G.WorldView, G.World, H5.FixRezScreenShaker, G.createViewPort, H5.Camera, G.PlayerController, G.Scene,
    H5.wrap);