import {iSQLiteDatabase} from "./i_sqlite_database";
import {SQLiteInstance} from "../js_to_typescript_adapters/react-native-sqlite-2";
import {ErrorCallback, TransactionCallback} from "../types";
import {Transaction} from "./transaction";

/*
A wrapper class for the react-native-sqlite-2 module.
 */
export class SQLiteDatabase implements iSQLiteDatabase {

	private sqLiteDb: any;
	private name: string;

	constructor(name: string) {
		this.name = name;
		let databaseName: string = name + ".sqlite3";
		this.sqLiteDb = SQLiteInstance.openDatabase(databaseName, "", "", "");
	}

	close(callback: ErrorCallback): void {
		this.sqLiteDb.closeDatabase(callback);
	}

	transaction(callback: TransactionCallback, errorCallback: ErrorCallback): void {
		new Transaction(this.sqLiteDb, callback, errorCallback);
	}

	getName(): string {
		return this.name;
	}


}