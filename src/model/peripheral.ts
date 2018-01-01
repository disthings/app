import {
	PeripheralType, Subscriber, UserDataStructure, DataSet, RequestDataPackage
} from "../types";
import {Logger} from "../logger";

export abstract class Peripheral {

	private name: string;
	private data: Array<UserDataStructure>;
	private type: PeripheralType;
	private subscribers: Map<string, Array<Subscriber>>;

	constructor(name: string, type: PeripheralType) {
		this.name = name;
		this.type = type;
		this.subscribers = new Map<string, Array<Subscriber>>();
		this.data = [];
	}

	getData(): Array<UserDataStructure> {
		return this.data;
	}

	getName(): string {
		return this.name;
	}

	getType(): PeripheralType {
		return this.type;
	}

	subscribeToEvent(eventName: string, callback: Function, id: string): void {
		let subs: Array<Subscriber> = this.subscribers.get(eventName) as Array<Subscriber>;
		if(!subs) {
			subs = [];
			this.subscribers.set(eventName, subs);
		}
		subs.push({callback: callback, id: id});
	}

	unsubscribeFromEvent(eventName: string, id: string): void {
		if(!(eventName in this.subscribers)) {
			Logger.error("No such event: " + eventName);
		}
		else {
			let subs: Array<Subscriber> = this.subscribers.get(eventName) as Array<Subscriber>;
			let i: number = 0;
			let found: boolean = false;
			while(!found && i < subs.length) {
				if(found = subs[i].id === id) {
					subs.splice(i, 1);
				}
				i++;
			}
		}
	}

	informEventSubscribers(eventName: string, ...args: Array<any>): void {
		const subs: Array<Subscriber> = this.subscribers.get(eventName) as Array<Subscriber>;

		if(subs) {
			subs.forEach((sub: Subscriber) => {
				sub.callback(args);
			});
		}
	}

	setData(data: Array<UserDataStructure>): void {
		this.data = data;
		this.informEventSubscribers("newViewData");
		this.informEventSubscribers("newTileData");
	}

	sendCommand(commandName: string, commandData: any): void {
		this.informEventSubscribers("command", commandName, commandData);
	}

	initializeData(): void {
		this.setData([]);
	}

	getRequestDataPackage(): RequestDataPackage {
		return {
			"name": this.getName(),
			"timestamp": Date.now(),
			"data": [],
			"peripheralType": PeripheralType.SERVER,
			"dataSet": DataSet.TILE
		};
	}

	abstract getOldData(): UserDataStructure;
	abstract deleteOldDataFromMemory(): void;
	abstract getTileData(): any;
	abstract getViewData(): any;
	abstract getSettingsData(): any;
}