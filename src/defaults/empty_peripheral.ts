import {iClientPeripheral} from "../model/i_client_peripheral";
import {iTransaction} from "../model/i_transaction";
import {DataSet, PeripheralType, QueryResultCallback, RequestDataPackage, UserDataStructure} from "../types";
import {iServerPeripheral} from "../model/i_server_peripheral";
import {Peripheral} from "../model/peripheral";
import {Logger} from "../logger";

export class EmptyPeripheral extends Peripheral implements iClientPeripheral, iServerPeripheral {

	constructor(name: string, type: PeripheralType) {
		super(name, type);
		Logger.warn("You created an EmptyPeripheral named: " + name + ". Please check the class for more information.");
	}

	getOldData(): UserDataStructure {
		return {};
	}

	emptyDataTable(_transaction: iTransaction, _callback: QueryResultCallback): void {
		return;
	}

	createDbTables(_transaction: iTransaction, _callback: QueryResultCallback): void {
		return;
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

	getSettingsData(): any {
		return {};
	}

	removeOldData(): void {
		return;
	}

	getRequestDataPackage(): RequestDataPackage {
		return {
			name: "EmptyPeripheral",
			timestamp: -1,
			data: {},
			peripheralType: PeripheralType.EMPTY,
			dataSet: DataSet.NONE
		};
	}

	deleteOldDataFromMemory(): void {
		return;
	}

	initializeData(): void {
		return;
	}
}