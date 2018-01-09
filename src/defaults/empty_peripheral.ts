import {iClientPeripheral} from "../model/i_client_peripheral";
import {PeripheralType, RequestDataPackage, UserDataStructure} from "../types";
import {iServerPeripheral} from "../model/i_server_peripheral";
import {Peripheral} from "../model/peripheral";

/*
This is a default implementation of the class Peripheral, used for avoiding null.
It should be used only for testing purposes or for initializing a variable.
 */
export class EmptyPeripheral extends Peripheral implements iClientPeripheral, iServerPeripheral {

	constructor(name: string, type: PeripheralType) {
		super(name, type);
		console.warn("You created an EmptyPeripheral named: " + name + ". Please check the class for more information.");
	}

	removeOldData(): UserDataStructure {
		return {};
	}

	readPeripheralData(): void {
		return;
	}

	getTileData(): any {
		return {};
	}

	getViewData(): any {
		return {};
	}

	getRequestDataPackage(): RequestDataPackage {
		return {
			name: "EmptyPeripheral",
			timestamp: -1,
			data: {},
			peripheralType: PeripheralType.EMPTY
		};
	}

	initializeData(): void {
		return;
	}
}