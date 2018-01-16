import {AsyncStorage} from "react-native";
import {StartingSettings} from "../starting_settings";
import {ErrorCallback, Settings} from "../types";

/*
This is a wrapper class around AsyncStorage. It is used to manage the application settings.
 */
export class SettingsManager {

	static getStartingSettings(): StartingSettings {
		return StartingSettings.getInstance();
	}

	static setRuntimeSettings(settings: Settings, callback: (error: Error) => void): void {
		AsyncStorage.setItem("settings", JSON.stringify(settings), callback);
	}

	static getRuntimeSettings(callback: (error: Error, result: Settings) => void): void {
		AsyncStorage.getItem("settings", (error: Error, result: string) => {

			const startingSettings: StartingSettings = this.getStartingSettings();
			const mergedSettings: any = Object.assign(startingSettings, JSON.parse(result));

			callback(error, mergedSettings);
		});
	}

	static resetSettings(callback: ErrorCallback): void {
		SettingsManager.setRuntimeSettings(StartingSettings.getInstance(), callback);
	}

	static loadMissingSettings(_callback: Function): void {

	}
}