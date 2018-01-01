import {iSyncManager} from "../../src/model/i_sync_manager";
import {MessageCallback, Settings, Subscriber, Message} from "../../src/types";
import {Logger} from "../../src/logger";
import {SettingsManager} from "../../src/model/settings_manager";
import * as WebSocket from "ws";

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

		this.webSocket.onerror = (error: Error): void => {
			Logger.warn("WebSocket " + error);
		};

		this.webSocket.onmessage = (ev: {data: {}, type: string, target: WebSocket}): void => {
			let message: Message = JSON.parse(ev.data as string);
			this.informMessageSubscribers(message);
		};
	}

	sendMessage(message: Message): void {
		this.webSocket.send(JSON.stringify(message));
	}

	subscribeToMessage(messageType: string, callback: MessageCallback, id: string): void {
		let subs: Array<Subscriber> = this.getIncomingMessageSubscribers(messageType);
		if(!subs) {
			subs = [];
			this.incomingMessageSubscribers.set(messageType, subs);
		}
		subs.push({"callback": callback, "id": id});
	}

	onSocketReady(callback: Function, id: string): void {
		let subs: Array<Subscriber> = this.getIncomingMessageSubscribers("onSocketReady");
		if(!subs) {
			subs = [];
			this.incomingMessageSubscribers.set("onSocketReady", subs);
		}
		subs.push({"callback": callback, "id": id});
	}

	onSocketDisconnect(callback: Function, id: string): void {
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

	private informOnSocketReady(): void {
		const subs: Array<Subscriber> = this.getIncomingMessageSubscribers("onSocketReady");
		if(subs) {
			subs.forEach((subscriber: Subscriber) => {
				subscriber.callback();
			});
		}
	}

	private informOnSocketDisconnected(): void {
		const subs: Array<Subscriber> = this.getIncomingMessageSubscribers("onSocketDisconnect");
		if(subs) {
			subs.forEach((subscriber: Subscriber) => {
				subscriber.callback();
			});
		}
	}

	private getIncomingMessageSubscribers(messageType: string): Array<Subscriber> {
		let subscribers: Array<Subscriber> = this.incomingMessageSubscribers.get(messageType) as Array<Subscriber>;
		if(!subscribers) {
			subscribers = [];
		}
		return subscribers;
	}

	private tryToConnect(): void {
		setTimeout(() => {
			this.webSocket = new WebSocket(this.webSocketAddress);
			this.activateSocketListeners();
		}, this.webSocketReconnectionInterval);
	}
}