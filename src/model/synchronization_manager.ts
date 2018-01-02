import {iSyncManager} from "./i_synchronization_manager";
import {MessageCallback, Settings, SpreadArgumentsCallback, Subscriber} from "../types";
import {Message} from "../types";
import {SettingsManager} from "./settings_manager";

/*
A wrapper class around the WebSocket class. It offers incoming and outgoing message management,
and reconnects automatically.
 */
export class SyncManager implements iSyncManager {

	private incomingMessageSubscribers: Map<string, Array<Subscriber>>;
	private webSocket: WebSocket;
	private webSocketAddress: string;
	private webSocketReconnectionInterval: number;
	private settings: any;

	constructor() {

		this.incomingMessageSubscribers = new Map<string, Array<Subscriber>>();

		this.incomingMessageSubscribers.set("onSocketReady", []);
		this.incomingMessageSubscribers.set("onSocketDisconnect", []);
		this.incomingMessageSubscribers.set("onSocketReconnect", []);

		// get the settings and connect
		SettingsManager.getRuntimeSettings((_error: Error, result: Settings) => {
			this.settings = result.webSocket;
			this.webSocketAddress = this.settings.host + ":" + this.settings.port + this.settings.path;
			this.webSocketReconnectionInterval = this.settings.reconnectionInterval;
			this.tryToConnect();
		});
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
		let subs: Array<Subscriber> = this.getIncomingMessageSubscribers(messageType);
		if(!subs) {
			subs = [];
			this.incomingMessageSubscribers.set(messageType, subs);
		}
		subs.push({"callback": callback, "id": id});
	}

	onSocketReady(callback: SpreadArgumentsCallback, id: string): void {
		let subs: Array<Subscriber> = this.getIncomingMessageSubscribers("onSocketReady");
		if(!subs) {
			subs = [];
			this.incomingMessageSubscribers.set("onSocketReady", subs);
		}
		subs.push({"callback": callback, "id": id});
	}

	onSocketDisconnect(callback: SpreadArgumentsCallback, id: string): void {
		let subs: Array<Subscriber> = this.getIncomingMessageSubscribers("onSocketDisconnect");
		if(!subs) {
			subs = [];
			this.incomingMessageSubscribers.set("onSocketDisconnect", subs);
		}
		subs.push({"callback": callback, "id": id});
	}

	private informMessageSubscribers(message: Message): void {
		const subscribers: Array<Subscriber> = this.getIncomingMessageSubscribers(message.type);
		if(message.type === "Error: Illegal message received") {
			console.warn(message.type);
		}
		else {
			subscribers.forEach((subscriber: Subscriber) => {
				subscriber.callback(message);
			});
		}
	}

	private informSubscribers(type: string): void {
		const subs: Array<Subscriber> = this.getIncomingMessageSubscribers(type);
		if(subs) {
			subs.forEach((subscriber: Subscriber) => {
				subscriber.callback();
			});
		}
	}

	private informOnSocketReady(): void {
		this.informSubscribers("onSocketReady");
	}

	private informOnSocketDisconnected(): void {
		this.informSubscribers("onSocketDisconnect");
	}

	private getIncomingMessageSubscribers(messageType: string): Array<Subscriber> {
		return this.incomingMessageSubscribers.get(messageType) as Array<Subscriber>;
	}

	private tryToConnect(): void {
		setTimeout(() => {
			this.webSocket = new WebSocket(this.webSocketAddress);
			this.activateSocketListeners();
		}, this.webSocketReconnectionInterval);
	}
}