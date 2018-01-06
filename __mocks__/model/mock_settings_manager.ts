import {MockedAsyncStorage} from "./mock_async_storage";
import {StartingSettings} from "../../src/starting_settings";
import {Settings} from "../../src/types";

export namespace SettingsManager {

	export function getStartingSettings(): StartingSettings {
		return StartingSettings.getInstance();
	}

	export function setRuntimeSettings(settings: Settings, callback: (error: Error) => void): void {
		MockedAsyncStorage.setItem("settings", JSON.stringify(settings), callback);
	}

	export function getRuntimeSettings(callback: (error: Error, result?: Settings) => void): void {
		MockedAsyncStorage.getItem("settings", (error: Error, result: string) => {
			if(result) {
				callback(error, JSON.parse(result));
			}
			else {
				callback(error);
			}

		});
	}

	export function resetSettings(callback: (error: Error) => void): void {
		setRuntimeSettings(getStartingSettings(), callback);
	}
}