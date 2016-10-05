G.MyGameResources = (function (AtlasResourceHelper, DeviceInfo, userAgent, resolveAtlasPaths, File, UI) {
    "use strict";

    // your files
    var scenes, atlases = [];

    function registerFiles(resourceLoader) {
        // add your files to the resource loader for downloading
        var isMobile = new DeviceInfo(userAgent, 1, 1, 1).isMobile;
        AtlasResourceHelper.register(resourceLoader, atlases, isMobile, resolveAtlasPaths);

        scenes = resourceLoader.addJSON(File.SCENES);

        return resourceLoader.getCount(); // number of registered files
    }

    function processFiles() {

        return {
            // services created with downloaded files
            gfxCache: AtlasResourceHelper.processLowRez(atlases, UI.WIDTH, UI.HEIGHT),
            scenes: scenes
        };
    }

    return {
        create: registerFiles,
        process: processFiles
    };
})(H5.AtlasResourceHelper, H5.Device, window.navigator.userAgent, G.resolveAtlasPaths, G.File, G.UI);