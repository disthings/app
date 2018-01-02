import {
	PeripheralType, Subscriber, UserDataStructure, DataSet, RequestDataPackage
} from "../types";

/*
To create a peripheral, this class must be extended, and one of the iClientPeripheral or iServerPeripheral interfaces
must be implemented. It has a subscribe/publish mechanism to inform on events, and an array to save its data. It can
also send commands to the server.
 */
export abstract class Peripheral {

	private name: string;
	private type: PeripheralType;
	private subscribers: Map<string, Array<Subscriber>>;
	private data: Array<UserDataStructure>;

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

	/*
	Use this to subscribe to some peripheral related event.
	 */
	subscribeToEvent(eventName: string, callback: Function, subscriberID: string): void {
		let subs: Array<Subscriber> = this.subscribers.get(eventName) as Array<Subscriber>;
		if(!subs) {
			subs = [];
			this.subscribers.set(eventName, subs);
		}
		subs.push({callback: callback, id: subscriberID});
	}

	/*
	Use this to unsubscribe to some peripheral related event.
	 */
	unsubscribeFromEvent(eventName: string, subscriberID: string): void {
		if(!this.subscribers.get(eventName)) {
			console.error("No such event: " + eventName);
		}
		else {
			let subs: Array<Subscriber> = this.subscribers.get(eventName) as Array<Subscriber>;
			let i: number = 0;
			let found: boolean = false;
			while(!found && i < subs.length) {
				if(found = subs[i].id === subscriberID) {
					subs.splice(i, 1);
				}
				i++;
			}
		}
	}

	/*
	Use this to call the callbacks of all subscribers of an event. Pass any further arguments using the ...args.
	 */
	protected informEventSubscribers(eventName: string, ...args: Array<any>): void {
		const subs: Array<Subscriber> = this.subscribers.get(eventName) as Array<Subscriber>;

		if(subs) {
			subs.forEach((sub: Subscriber) => {
				sub.callback(args);
			});
		}
	}

	/*
	Sets the data and informs the tile and view of the existence of new data. Since data is an array, you could	change
	its contents without setData. It is advised to just getData(), apply changes, and use setData() to save them. This
	way you can ensure that the changes are being propagated to the view.
	 */
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

	/*
	This method is being called for requesting data for server peripherals.
	 */
	getRequestDataPackage(): RequestDataPackage {
		return {
			"name": this.getName(),
			"timestamp": Date.now(),
			"data": [],
			"peripheralType": PeripheralType.SERVER,
			"dataSet": DataSet.TILE
		};
	}

	/*
	Implement this method to sort through the data array and return what you consider as old data.
	 */
	abstract getOldData(): UserDataStructure;

	/*
	Implement this method to delete data you consider as old from the data array.
	 */
	abstract deleteOldDataFromMemory(): void;

	/*
	Implement this method to sort through the data array and return the data you want to show on the tile.
	 */
	abstract getTileData(): any;

	/*
	Implement this method to sort through the data array and return the data you want to show on the view.
	 */
	abstract getViewData(): any;
}