import {
	PeripheralType, UserDataStructure, RequestDataPackage, SingleArgumentCallback, Command
} from "../types";
import {Publisher} from "../publisher";

/*
To create a peripheral, this class must be extended, and one of the iClientPeripheral or iServerPeripheral interfaces
must be implemented. It has a subscribe/publish mechanism to inform on events, and an array to save its data. It can
also send commands to the server.
 */
export abstract class Peripheral {

	private name: string;
	private type: PeripheralType;
	private publisher: Publisher;
	private data: Array<UserDataStructure>;

	constructor(name: string, type: PeripheralType) {
		this.name = name;
		this.type = type;
		this.publisher = new Publisher();
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
	subscribeToEvent(eventName: string, callback: SingleArgumentCallback, subscriberID: string): void {
		this.publisher.subscribeToEvent(eventName, callback, subscriberID);
	}

	/*
	Use this to unsubscribe from some peripheral related event.
	 */
	unsubscribeFromEvent(eventName: string, subscriberID: string): void {
		if(!this.publisher.getEventSubscribers(eventName)) {
			console.error(new Error("No such event: " + eventName));
		}
		else {
			this.publisher.unsubscribeFromEvent(eventName, subscriberID);
		}
	}

	/*
	Use this to call the callbacks of all subscribers of an event. Pass any further arguments using the args.
	 */
	protected informEventSubscribers(eventName: string, args?: {}): void {
		this.publisher.informEventSubscribers(eventName, args);
	}

	/*
	Sets the data and informs the tile and view of the existence of new data. Since data is an array, you could	change
	its contents without setData. It is advised to just getData(), apply changes, and use setData() to save them. This
	way you can ensure that the changes are being propagated to the view.
	 */
	setData(data: Array<UserDataStructure>): void {
		this.data = data;
		this.informEventSubscribers("newData");
	}

	sendCommand(command: Command): void {
		this.informEventSubscribers("command", command);
	}

	initializeData(): void {
		this.setData([]);
	}

	/*
	This method creates a package useful for the server to identify the peripheral being requested.
	 */
	getRequestDataPackage(): RequestDataPackage {
		return {
			"name": this.getName(),
			"timestamp": Date.now(),
			"data": [],
			"peripheralType": PeripheralType.SERVER
		};
	}

	/*
	Implement this method to sort through the data array and return the data you want to show on the tile.
	 */
	abstract getTileData(): any;

	/*
	Implement this method to sort through the data array and return the data you want to show on the view.
	 */
	abstract getViewData(): any;
}