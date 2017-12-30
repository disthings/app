import {iClientPeripheral} from "../model/i_client_peripheral";
import {iTransaction} from "../model/i_transaction";
import {PeripheralType, QueryResultCallback, RequestDataPackage, UserDataStructure} from "../types";
import {iServerPeripheral} from "../model/i_server_peripheral";
import {DefaultValues} from "./default_values";
import {Peripheral} from "../model/peripheral";

export class EmptyPeripheral extends Peripheral implements iClientPeripheral, iServerPeripheral {


	getOldData(): UserDataStructure {
		return {};
	}

	emptyDataTable(_transaction: iTransaction, _callback: QueryResultCallback): void {
		console.error("You are using the default implementation EmptyPeripheral. Please read the comments in the class.");
		return;
	}

	createDbTables(_transaction: iTransaction, _callback: QueryResultCallback): void {
		console.error("You are using a default implementation of Peripheral, EmptyPeripheral. Please read the comments in the class.");
		return;
	}

	readPeripheralData(): void {
		console.error("You are using a default implementation of Peripheral, EmptyPeripheral. Please read the comments in the class.");
		return;
	}

	getTileData(): any {
		console.error("You are using a default implementation of Peripheral, EmptyPeripheral. Please read the comments in the class.");
		return {};
	}

	getViewData(): any {
		console.error("You are using a default implementation of Peripheral, EmptyPeripheral. Please read the comments in the class.");
		return {};
	}

	getSettingsData(): any {
		console.error("You are using a default implementation of Peripheral, EmptyPeripheral. Please read the comments in the class.");
		return {};
	}

	getName(): string {
		console.error("You are using a default implementation of Peripheral, EmptyPeripheral. Please read the comments in the class.");
		return "";
	}

	getType(): PeripheralType {
		console.error("You are using a default implementation of Peripheral, EmptyPeripheral. Please read the comments in the class.");
		return PeripheralType.EMPTY;
	}

	removeOldData(): void {
		console.error("You are using a default implementation of Peripheral, EmptyPeripheral. Please read the comments in the class.");
		return;
	}

	getRequestDataPackage(): RequestDataPackage {
		console.error("You are using a default implementation of Peripheral, EmptyPeripheral. Please read the comments in the class.");
		return DefaultValues.REQUEST_DATA_PACKAGE;
	}

	deleteOldDataFromMemory(): void {
		console.error("You are using a default implementation of Peripheral, EmptyPeripheral. Please read the comments in the class.");
	}

	initializeData(): void {
		console.error("You are using a default implementation of Peripheral, EmptyPeripheral. Please read the comments in the class.");
	}
}