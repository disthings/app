import {iSQLiteDatabase} from "./i_sqlite_database";
import {
	ErrorCallback, PeripheralPartsContainer, QueryResultAsUserDataStructureCallback, QueryResultCallback,
	UserDataStructure
} from "../types";
import {iTransaction} from "./i_transaction";
import {iPeripheral} from "./i_peripheral";

export interface iDataManager {
	createDatabase(name: string): iSQLiteDatabase;
	getDatabase(name: string): iSQLiteDatabase;
	closeDatabase(name: string, errorCallback: ErrorCallback): void;
	getClientPeripherals(): Array<PeripheralPartsContainer>;
	getServerPeripherals(): Array<PeripheralPartsContainer>;
	addPeripheralToMemory(peripheralPartsContainer: PeripheralPartsContainer): void;
	createDbTables(peripheral: iPeripheral, transaction: iTransaction, callback: QueryResultCallback): void;
	insertDataIntoDataTable(peripheral: iPeripheral, data: Array<UserDataStructure>, transaction: iTransaction,
							callback: QueryResultCallback): void;
	insertDataIntoBackupTable(peripheral: iPeripheral, data: Array<UserDataStructure>, transaction: iTransaction,
							  callback: QueryResultCallback): void;
	restoreAllDataFromDataTable(peripheral: iPeripheral, transaction: iTransaction, callback: QueryResultAsUserDataStructureCallback): void;
	restoreAllDataFromBackupTable(peripheral: iPeripheral, transaction: iTransaction, callback: QueryResultAsUserDataStructureCallback): void;
	emptyDataTable(peripheral: iPeripheral, transaction: iTransaction, callback: QueryResultCallback): void;
	emptyBackupTable(peripheral: iPeripheral, transaction: iTransaction, callback: QueryResultCallback): void;
}