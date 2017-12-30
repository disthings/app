import {Message} from "../types";
import {MessageCallback} from "../types";

export interface iSyncManager {
	sendMessage(data: Message): void;
	subscribeToMessage(messageType: string, callback: MessageCallback, id: string): void;
	onSocketReady(callback: Function, id: string): void;
	onSocketDisconnect(callback: Function, id: string): void;
}