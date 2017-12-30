import {iSyncManager} from "./i_sync_manager";
import {Map, MessageCallback, Settings, Subscriber} from "../types";
import {Message} from "../types";
import {Logger} from "../logger";
import {SettingsManager} from "./settings_manager";

export class SyncManager implements iSyncManager {

	private incomingMessageSubscribers: Map<Array<Subscriber>>;
	private webSocket: WebSocket;
	private webSocketAddress: string;
	private webSocketReconnectionInterval: number;
	private settings: any;

	constructor() {
		this.incomingMessageSubscribers = {
			"onSocketReady": [],
			"onSocketDisconnect": [],
			"onSocketReconnect": []
		};

		if(!global) {
			SettingsManager.getRuntimeSettings((_error: Error, result: Settings) => {
				this.settings = result.webSocket;
				this.webSocketAddress = this.settings.host + ":" + this.settings.port + this.settings.path;
				this.webSocketReconnectionInterval = this.settings.reconnectionInterval;
				this.tryToConnect();
			});
		}
		else {
			this.settings = SettingsManager.getStartingSettings().webSocket;
			this.webSocketAddress = "192.168.1.101" + ":" + this.settings.port + this.settings.path;
			this.webSocketReconnectionInterval = this.settings.reconnectionInterval;
			this.tryToConnect();
		}
	}

	private activateSocketListeners(): void {
		this.webSocket.onopen = (): void => {
			this.informOnSocketReady();
		};

		this.webSocket.onclose = (): void => {
			this.informOnSocketDisconnected();
			this.tryToConnect();
		};

		this.webSocket.onerror = (error: Event): void => {
			Logger.warn("WebSocket " + error.type);
		};

		this.webSocket.onmessage = (ev: MessageEvent): any => {
			let message: Message = JSON.parse(ev.data as string);
			this.informMessageSubscribers(message);
		};
	}

	sendMessage(message: Message): void {
		this.webSocket.send(JSON.stringify(message));
	}

	subscribeToMessage(messageType: string, callback: MessageCallback, id: string): void {
		if(!(messageType in this.incomingMessageSubscribers)) {
			this.incomingMessageSubscribers[messageType] = [];
		}
		this.incomingMessageSubscribers[messageType].push({"callback": callback, "id": id});
	}

	onSocketReady(callback: Function, id: string): void {
		this.incomingMessageSubscribers.onSocketReady.push({"callback": callback, "id": id});
	}

	onSocketDisconnect(callback: Function, id: string): void {
		this.incomingMessageSubscribers.onSocketDisconnect.push({"callback": callback, "id": id});
	}

	private informMessageSubscribers(message: Message): void {
		const subscribers: Array<Subscriber> = this.incomingMessageSubscribers[message.type];
		subscribers.forEach((subscriber: Subscriber) => {
			subscriber.callback(message);
		});
	}

	private informOnSocketReady(): void {
		this.incomingMessageSubscribers.onSocketReady.forEach((subscriber: Subscriber) => {
			subscriber.callback();
		});
	}

	private informOnSocketDisconnected(): void {
		this.incomingMessageSubscribers.onSocketDisconnect.forEach((subscriber: Subscriber) => {
			subscriber.callback();
		});
	}

	private tryToConnect(): void {
		setTimeout(() => {
			this.webSocket = new WebSocket(this.webSocketAddress);
			this.activateSocketListeners();
		}, this.webSocketReconnectionInterval);
	}
}