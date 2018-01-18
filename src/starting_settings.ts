import {DataManagerStartingSettings, WebSocketStartingSettings} from "./types";

export class StartingSettings {

	private static instance: StartingSettings = new StartingSettings(); // initialize singleton

	readonly dataRequestInterval: number = 2000;
	// if the server is not responding after an interval defined above,
	// wait for so many intervals before requesting again
	readonly maxSkippedIntervals: number = 6;

	readonly webSocket: WebSocketStartingSettings = {
		host: "", // the user must define the host
		port: 1880,
		path: "/peripherals",
		reconnectionInterval: 500
	};

	readonly dataManager: DataManagerStartingSettings = {
		dataRetentionInterval: 10000
	};

	readonly currentTheme: string = "light";

	constructor() {
		if(StartingSettings.instance) {
			throw new Error("Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.");
		}
		StartingSettings.instance = this;
	}

	public static getInstance(): StartingSettings {
		return StartingSettings.instance;
	}
}