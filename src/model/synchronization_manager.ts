import {iSyncManager} from "./i_synchronization_manager";
import {MessageCallback, Settings, SingleArgumentCallback} from "../types";
import {Message} from "../types";
import {SettingsManager} from "./settings_manager";
import {Publisher} from "../publisher";

/*
A wrapper class around the WebSocket class. It offers incoming and outgoing message management,
and reconnects automatically.
 */
export class SyncManager implements iSyncManager {

	private publisher: Publisher;
	private webSocket!: WebSocket;
	private webSocketAddress!: string;
	private webSocketReconnectionInterval!: number;
	private settings: any;

	constructor() {

		this.publisher = new Publisher();

		// get the settings and try to connect
		SettingsManager.getRuntimeSettings((_error: Error, result: Settings) => {
			this.settings = result.webSocket;
			this.webSocketAddress = this.settings.host + ":" + this.settings.port + this.settings.path;
			this.webSocketReconnectionInterval = this.settings.reconnectionInterval;
			this.tryToConnect();
		});
	}

	private activateWebSocketListeners(): void {
		this.webSocket.onopen = (): void => {
			this.informOnSocketReady();
		};

		this.webSocket.onclose = (): void => {
			this.informOnSocketDisconnected();
			this.tryToConnect();
		};

		this.webSocket.onerror = (error: Event): void => {
			console.warn("WebSocket " + error.type);
		};

		this.webSocket.onmessage = (ev: MessageEvent): any => {
			let message: Message = JSON.parse(ev.data as string);
			this.informMessageSubscribers(message);
		};
	}

	sendMessage(message: Message): void {
		this.webSocket.send(JSON.stringify(message));
	}

	subscribeToMessageType(messageType: string, callback: MessageCallback, id: string): void {
		this.publisher.subscribeToEvent(messageType, callback, id);
	}

	onSocketReady(callback: SingleArgumentCallback, id: string): void {
		this.publisher.subscribeToEvent("onSocketReady", callback, id);
	}

	onSocketDisconnect(callback: SingleArgumentCallback, id: string): void {
		this.publisher.subscribeToEvent("onSocketDisconnect", callback, id);
	}

	private informMessageSubscribers(message: Message): void {
		if(message.type === "Error: Illegal message received") {
			console.warn(message.type);
		}
		else {
			this.publisher.informEventSubscribers(message.type, message);
		}
	}

	private informOnSocketReady(): void {
		this.publisher.informEventSubscribers("onSocketReady");
	}

	private informOnSocketDisconnected(): void {
		this.publisher.informEventSubscribers("onSocketDisconnect");
	}

	private tryToConnect(): void {
		setTimeout(() => {
			this.webSocket = new WebSocket(this.webSocketAddress);
			this.activateWebSocketListeners();
		}, this.webSocketReconnectionInterval);
	}
}