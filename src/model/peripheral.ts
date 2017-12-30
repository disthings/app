import {
	PeripheralType, Subscriber, Map, UserDataStructure, DataSet, RequestDataPackage
} from "../types";
import {Logger} from "../logger";

export abstract class Peripheral {

	private name: string;
	private data: Array<UserDataStructure>;
	private type: PeripheralType;
	private subscribers: Map<Array<Subscriber>>;

	constructor(name: string, type: PeripheralType) {
		this.name = name;
		this.type = type;
		this.subscribers = {};
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
		if(!(eventName in this.subscribers)) {
			this.subscribers[eventName] = [];
		}
		this.subscribers[eventName].push({callback: callback, id: id});
	}

	unsubscribeFromEvent(eventName: string, id: string): void {
		if(!(eventName in this.subscribers)) {
			Logger.error("No such event: " + eventName);
		}
		else {
			let subs: Array<Subscriber> = this.subscribers[eventName];
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
		if(eventName in this.subscribers) {
			let subs: Array<Subscriber> = this.subscribers[eventName];

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