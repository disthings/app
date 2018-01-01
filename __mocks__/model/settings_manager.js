"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async_storage_1 = require("./async_storage");
const starting_settings_1 = require("../../src/starting_settings");
var SettingsManager;
(function (SettingsManager) {
    function getStartingSettings() {
        return starting_settings_1.StartingSettings.getInstance();
    }
    SettingsManager.getStartingSettings = getStartingSettings;
    function setRuntimeSettings(settings, callback) {
        async_storage_1.MockedAsyncStorage.setItem("settings", JSON.stringify(settings), callback);
    }
    SettingsManager.setRuntimeSettings = setRuntimeSettings;
    function getRuntimeSettings(callback) {
        async_storage_1.MockedAsyncStorage.getItem("settings", (error, result) => {
            if (result) {
                callback(error, JSON.parse(result));
            }
            else {
                callback(error);
            }
        });
    }
    SettingsManager.getRuntimeSettings = getRuntimeSettings;
    function resetSettings(callback) {
        setRuntimeSettings(getStartingSettings(), callback);
    }
    SettingsManager.resetSettings = resetSettings;
})(SettingsManager = exports.SettingsManager || (exports.SettingsManager = {}));
//# sourceMappingURL=settings_manager.js.map