import {iDataManager} from "./i_data_manager";
import {
	DatabaseTable, ErrorCallback, iPeripheralInternal, PeripheralPartsContainer, PeripheralType, TransactionCallback,
	UserDataStructure
} from "../types";
import {iSQLiteDatabase} from "./i_sqlite_database";
import {SQLiteDatabase} from "./sqlite_database";
import {iTransaction} from "./i_transaction";
import {SettingsManager} from "./settings_manager";
import {Peripheral} from "./peripheral";
import {errorCallback} from "../generic_functions";


/*
Here you can find how the data is being managed, in memory and in the Database.
 */
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
				let peripheral: iPeripheralInternal = peripheralParts.peripheral as iPeripheralInternal;
				let db: iSQLiteDatabase = this.getDatabase(peripheralParts.key);
				db.transaction((transaction: iTransaction) => {
					this.insertDataIntoDataTable(peripheral.getName(), peripheral.removeOldData(), transaction, () => {
						// console.log();
					});

				}, errorCallback);
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
			throw new Error("Database name already exists");
		}

		return this.getDatabase(name);
	}

	getDatabase(name: string): iSQLiteDatabase {
		if(!this.doesDatabaseExist(name)) {
			throw new Error("Database does not exist");
		}
		return this.databases.get(name) as iSQLiteDatabase;
	}

	closeDatabase(name: string, errorCallback: ErrorCallback): void {
		if(!this.doesDatabaseExist(name)) {
			throw new Error("Database does not exist");
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
				throw new Error("Invalid peripheral type: " + type);
			}
		}
		else {
			throw new Error("Duplicate peripheral name: " + name);
		}
	}
	/*
	Creates two tables for one peripheral. The Data and the Backup. In the first one are saved the data from memory as
	as blobs for the purpose of keeping memory usage low. In the second are saved the data from memory as blobs in case
	the app closes or goes to the background.
	 */
	createDbTables(peripheral: Peripheral, transaction: iTransaction, callback: Function): void {
		transaction.executeSql("CREATE TABLE '" + peripheral.getName() + "_" + DatabaseTable.DATA + "' (dataPackage BLOB);", [],
			() => {
				transaction.executeSql("CREATE TABLE '" + peripheral.getName() +  "_" + DatabaseTable.BACKUP + "' (dataPackage BLOB);", [], callback);
			});
	}

	insertDataIntoDataTable(peripheralName: string, data: Array<UserDataStructure>, transaction: iTransaction,
							callback: Function): void {

		this.insertDataIntoDb(peripheralName, DatabaseTable.DATA, data, transaction, callback);
	}

	insertPeripheralDataIntoBackupTable(peripheralName: string, data: Array<UserDataStructure>, transaction: iTransaction,
										callback: Function): void {

		this.insertDataIntoDb(peripheralName, DatabaseTable.BACKUP, data, transaction, callback);
	}

	private insertDataIntoDb(peripheralName: string, table: DatabaseTable, data: Array<UserDataStructure>,
							 transaction: iTransaction, callback: Function): void {

		const values: string = JSON.stringify(data);

		if(values !== "") {
			let query: string = "INSERT INTO '" + peripheralName +  "_" + table + "' (dataPackage) VALUES ('" + values + "');";
			transaction.executeSql(query, [], callback);
		}
		else {
			callback(transaction, new Error("No values to enter"));
		}
	}

	restoreAllDataFromDataTable(peripheralName: string, transaction: iTransaction, callback: TransactionCallback): void {
		this.restoreAllDataFromTable(peripheralName, DatabaseTable.DATA, transaction, callback);
	}

	restorePeripheralDataFromBackupTable(peripheralName: string, transaction: iTransaction, callback: TransactionCallback): void {
		this.restoreAllDataFromTable(peripheralName, DatabaseTable.BACKUP, transaction, callback);
	}

	private restoreAllDataFromTable(peripheralName: string, table: DatabaseTable,
									transaction: iTransaction, callback: TransactionCallback): void {

		const query: string = "SELECT * FROM '" +peripheralName +  "_" + table +"';";

		transaction.executeSql(query, [], (_transaction: iTransaction, result: any) => {
			let data: Array<UserDataStructure> = [];
			const rows: any = result.rows;
			if(rows) {
				for (let i: number = 0; i < rows.length; i++) {
					let row: any = rows.item(i).dataPackage;
					let parsedRow: Array<UserDataStructure> = JSON.parse(row);

					data = data.concat(parsedRow);
				}
			}
			callback(_transaction, data);
		});
	}

	emptyDataTable(peripheral: Peripheral, transaction: iTransaction, callback: Function): void {
		const query: string = "DELETE FROM '" + peripheral.getName() +  "_DATA" +"';";
		transaction.executeSql(query, [], callback);
	}

	emptyBackupTable(peripheral: Peripheral, transaction: iTransaction, callback: Function): void {
		const query: string = "DELETE FROM '" + peripheral.getName() +  "_BACKUP" +"';";
		transaction.executeSql(query, [], callback);
	}
}