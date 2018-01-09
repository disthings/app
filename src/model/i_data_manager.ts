import {iSQLiteDatabase} from "./i_sqlite_database";
import {ErrorCallback, PeripheralPartsContainer, TransactionCallback, UserDataStructure} from "../types";
import {iTransaction} from "./i_transaction";
import {Peripheral} from "./peripheral";

export interface iDataManager {
	createDatabase(name: string): iSQLiteDatabase;
	getDatabase(name: string): iSQLiteDatabase;
	closeDatabase(name: string, errorCallback: ErrorCallback): void;
	getClientPeripherals(): Array<PeripheralPartsContainer>;
	getServerPeripherals(): Array<PeripheralPartsContainer>;
	addPeripheralToMemory(peripheralPartsContainer: PeripheralPartsContainer): void;
	createDbTables(peripheral: Peripheral, transaction: iTransaction, callback: Function): void;
	insertDataIntoDataTable(peripheral: Peripheral, data: Array<UserDataStructure>, transaction: iTransaction,
							callback: Function): void;
	insertPeripheralDataIntoBackupTable(peripheral: Peripheral, data: Array<UserDataStructure>, transaction: iTransaction,
										callback: Function): void;
	restoreAllDataFromDataTable(peripheral: Peripheral, transaction: iTransaction, callback: TransactionCallback): void;
	restorePeripheralDataFromBackupTable(peripheral: Peripheral, transaction: iTransaction, callback: TransactionCallback): void;
	emptyDataTable(peripheral: Peripheral, transaction: iTransaction, callback: Function): void;
	emptyBackupTable(peripheral: Peripheral, transaction: iTransaction, callback: Function): void;
}