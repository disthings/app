import {iDataManager} from "../../src/model/i_data_manager";
import {
	DatabaseTable, ErrorCallback, PeripheralPartsContainer, PeripheralType, QueryResultAsUserDataStructureCallback,
	QueryResultCallback, UserDataStructure
} from "../../src/types";
import {iSQLiteDatabase} from "../../src/model/i_sqlite_database";
import {SettingsManager} from "./MOCK_settings_manager";
import {Peripheral} from "../../src/model/peripheral";
import {SQLiteDatabase} from "./MOCK_sqlite_database";
import {iTransaction} from "./MOCK_i_transaction";

export class DataManager implements iDataManager {

	private databases: Map<string, iSQLiteDatabase>;
	private clientPeripherals: Array<PeripheralPartsContainer>;
	private serverPeripherals: Array<PeripheralPartsContainer>;
	private settings: any;
	private dataRetentionInterval: number;

	constructor() {
		this.databases = new Map<string, iSQLiteDatabase>();
		this.clientPeripherals = [];
		this.serverPeripherals = [];

		this.settings = SettingsManager.getStartingSettings().dataManager;
		this.dataRetentionInterval = this.settings.dataRetentionInterval;

		this.activateDataRetentionInterval();
	}

	private activateDataRetentionInterval(): void {

		setInterval(() => {
			this.clientPeripherals.forEach((peripheralParts: PeripheralPartsContainer) => {
				let peripheral: Peripheral = peripheralParts.peripheral as Peripheral;
				let db: iSQLiteDatabase = this.getDatabase(peripheralParts.key);
				db.transaction((transaction: iTransaction) => {
					// todo peripheral and peripheral.getOldData()
					this.insertDataIntoDataTable(peripheral, peripheral.getOldData(), transaction, (_tx: iTransaction, _result: any) => {
						peripheral.deleteOldDataFromMemory();
					});

				}, (error: Error) => {
					console.error("activateDataRetentionInterval", error);
				});
			});
		}, this.dataRetentionInterval);
	}

	private doesDatabaseExist(name: string): boolean {
		return this.databases.get(name) !== undefined;
	}

	createDatabase(name: string): iSQLiteDatabase {
		if(!this.doesDatabaseExist(name)) {
			this.databases.set(name, new SQLiteDatabase(name));
		}
		else {
			console.error(new Error("Database name already exists"));
		}

		return this.getDatabase(name);
	}

	getDatabase(name: string): iSQLiteDatabase {
		if(!this.doesDatabaseExist(name)) {
			console.error(new Error("Database does not exist"));
		}
		return this.databases.get(name) as iSQLiteDatabase;
	}

	closeDatabase(name: string, errorCallback: ErrorCallback): void {
		if(!this.doesDatabaseExist(name)) {
			console.error(new Error("Database does not exist"));
		}
		this.getDatabase(name).close(errorCallback);
	}

	getClientPeripherals(): Array<PeripheralPartsContainer> {
		return this.clientPeripherals;
	}

	getServerPeripherals(): Array<PeripheralPartsContainer> {
		return this.serverPeripherals;
	}

	addPeripheralToMemory(peripheralPartsContainer: PeripheralPartsContainer): void {

		const peripheral: Peripheral = peripheralPartsContainer.peripheral as Peripheral;
		const name: string = peripheral.getName();
		const type: PeripheralType = peripheral.getType();
		if(!this.doesDatabaseExist(name)) {
			if(type === PeripheralType.CLIENT) {
				this.clientPeripherals.push(peripheralPartsContainer);
			}
			else if(type === PeripheralType.SERVER) {
				this.serverPeripherals.push(peripheralPartsContainer);
			}
			else {
				console.error(new Error("Invalid peripheral type: " + type));
			}
		}
		else {
			console.error(new Error("Duplicate peripheral name: " + name));
		}
	}

	createDbTables(peripheral: Peripheral, transaction: iTransaction, callback: Function): void {
		transaction.executeSql("CREATE TABLE '" + peripheral.getName() + "_" + DatabaseTable.DATA + "' (dataPackage BLOB);", [],
			(error: Error) => {
				if(!error.message.endsWith("already exists")) {
					console.error("createDbTables1", error);
				}

		});
		transaction.executeSql("CREATE TABLE '" + peripheral.getName() +  "_" + DatabaseTable.BACKUP + "' (dataPackage BLOB);", [],
			(error: Error) => {
				if(!error.message.endsWith("already exists")) {
					console.error("createDbTables2", error);
				}
		});
		callback();
	}

	insertDataIntoDataTable(peripheral: Peripheral, data: Array<UserDataStructure>, transaction: iTransaction,
							callback: QueryResultCallback): void {

		this.insertDataIntoDb(peripheral, DatabaseTable.DATA, data, transaction, callback);
	}

	insertDataIntoBackupTable(peripheral: Peripheral, data: Array<UserDataStructure>, transaction: iTransaction,
							  callback: QueryResultCallback): void {

		this.insertDataIntoDb(peripheral, DatabaseTable.BACKUP, data, transaction, callback);
	}

	private insertDataIntoDb(peripheral: Peripheral, table: DatabaseTable, data: Array<UserDataStructure>,
							 transaction: iTransaction, callback: Function): void {

		const values: string = JSON.stringify(data);

		if(values !== "") {
			let query: string = "INSERT INTO '" + peripheral.getName() +  "_" + table + "' (dataPackage) VALUES ('" + values + "');";
			transaction.executeSql(query, [], (error: Error) => {
				if(error) {
					console.error("insertDataIntoDb", error);
				}
			});
			callback();
		}
		else {
			callback(new Error("No values to enter"));
		}
	}

	restoreAllDataFromDataTable(peripheral: Peripheral, transaction: iTransaction, callback: QueryResultAsUserDataStructureCallback): void {
		this.restoreAllDataFromTable(peripheral, DatabaseTable.DATA, transaction, callback);
	}

	restoreAllDataFromBackupTable(peripheral: Peripheral, transaction: iTransaction, callback: QueryResultAsUserDataStructureCallback): void {
		this.restoreAllDataFromTable(peripheral, DatabaseTable.BACKUP, transaction, callback);
	}

	private restoreAllDataFromTable(peripheral: Peripheral, table: DatabaseTable,
									transaction: iTransaction, callback: Function): void {

		const query: string = "SELECT * FROM '" + peripheral.getName() +  "_" + table +"';";

		transaction.all(query, [], (_error: Error, result: any) => {

			let data: Array<UserDataStructure> = [];

			if(result) {
				for (let i: number = 0; i < result.length; i++) {
					let row: any = result[i].dataPackage;
					let parsedRow: Array<UserDataStructure> = JSON.parse(row);

					data = data.concat(parsedRow);
				}
			}
			callback(data);
		});
	}

	emptyDataTable(peripheral: Peripheral, transaction: iTransaction, callback: Function): void {
		const query: string = "DELETE FROM '" + peripheral.getName() +  "_DATA" +"';";
		transaction.executeSql(query, [], (error: Error) => {
			if(error) {
				console.error("emptyDataTable", error);
			}
		});
		callback();
	}

	emptyBackupTable(peripheral: Peripheral, transaction: iTransaction, callback: Function): void {
		const query: string = "DELETE FROM '" + peripheral.getName() +  "_BACKUP" +"';";
		transaction.executeSql(query, [], (error: Error) => {
			if(error) {
				console.error("emptyBackupTable", error);
			}
		});
		callback();
	}
}