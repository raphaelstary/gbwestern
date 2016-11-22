G.MyGameResources = (function (AtlasResourceHelper, DeviceInfo, userAgent, createAtlasPaths, File, UI, Sound, Object,
    AudioManager) {
    "use strict";

    // your files
    var scenes, atlases = [], sounds;

    function registerFiles(resourceLoader) {
        // add your files to the resource loader for downloading
        var isMobile = new DeviceInfo(userAgent, 1, 1, 1).isMobile;
        AtlasResourceHelper.register(resourceLoader, atlases, isMobile,
            createAtlasPaths().add(UI.HEIGHT).getResolver());

        scenes = resourceLoader.addJSON(File.SCENES);

        var keys = Object.keys(Sound);
        sounds = keys.map(function (soundKey) {
            return resourceLoader.addAudio(File.SOUND_PATH + Sound[soundKey] + File.SOUND_FORMAT);
        }).reduce(function (soundDict, sound, index) {
            soundDict[Sound[keys[index]]] = sound;
            return soundDict;
        }, {});

        return resourceLoader.getCount(); // number of registered files
    }

    function processFiles() {

        return {
            // services created with downloaded files
            gfxCache: AtlasResourceHelper.processLowRez(atlases, UI.WIDTH, UI.HEIGHT),
            scenes: scenes,
            sounds: new AudioManager(sounds)
        };
    }

    return {
        create: registerFiles,
        process: processFiles
    };
})(H5.AtlasResourceHelper, H5.Device, window.navigator.userAgent, H5.createAtlasPaths, G.File, G.UI, G.Sound, Object,
    H5.HtmlAudioManager);