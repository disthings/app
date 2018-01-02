import {AsyncStorage} from "react-native";
import {StartingSettings} from "../starting_settings";
import {Settings} from "../types";

export class SettingsManager {

	static getStartingSettings(): StartingSettings {
		return StartingSettings.getInstance();
	}

	static setRuntimeSettings(settings: Settings, callback: (error: Error) => void): void {
		AsyncStorage.setItem("settings", JSON.stringify(settings), callback);
	}

	static getRuntimeSettings(callback: (error: Error, result: Settings) => void): void {
		AsyncStorage.getItem("settings", (error: Error, result: string) => {
			callback(error, JSON.parse(result));
		});
	}

	static resetSettings(callback: (error: Error) => void): void {
		SettingsManager.setRuntimeSettings(StartingSettings.getInstance(), callback);
	}
}