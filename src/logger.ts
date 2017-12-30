import {SettingsManager} from "./model/settings_manager";

export namespace Logger {

	const isActive: boolean = SettingsManager.getStartingSettings().logger.isActive;

	export function log(...args: Array<any>): void {
		if (isActive) {
			console.log.apply(console, Array.prototype.slice.call(args));
		}
	}

	export function warn(...args: Array<any>): void {
		if(isActive) {
		console.warn.apply(console, Array.prototype.slice.call(args));
		}
	}

	export function error(...args: Array<any>): void {
		if(isActive) {
		console.error.apply(console, Array.prototype.slice.call(args));
		}
	}
}