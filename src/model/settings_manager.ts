import {AsyncStorage} from "react-native";
import {StartingSettings} from "../starting_settings";
import {Settings} from "../types";

export namespace SettingsManager {

	export function getStartingSettings(): StartingSettings {
		return StartingSettings.getInstance();
	}

	export function setRuntimeSettings(settings: Settings, callback: (error: Error) => void): void {
		AsyncStorage.setItem("settings", JSON.stringify(settings), callback);
	}

	export function getRuntimeSettings(callback: (error: Error, result: Settings) => void): void {
		AsyncStorage.getItem("settings", (error: Error, result: string) => {
			callback(error, JSON.parse(result));
		});
	}

	export function resetSettings(callback: (error: Error) => void): void {
		setRuntimeSettings(getStartingSettings(), callback);
	}
}