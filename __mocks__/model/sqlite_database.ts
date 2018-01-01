import {iSQLiteDatabase} from "../../src/model/i_sqlite_database";
const SQLiteInstance: any = require("sqlite3").verbose();
const TransactionDatabase: any = require("sqlite3-transactions").TransactionDatabase;
import {ErrorCallback, TransactionCallback} from "../../src/types";
import {Transaction} from "./transaction";
import {iTransactionInternal} from "../../src/model/i_transaction_internal";

export class SQLiteDatabase implements iSQLiteDatabase {

	private sqLiteDb: any;
	private name: string;

	constructor(name: string) {
		this.name =name;
		this.sqLiteDb = new TransactionDatabase(new SQLiteInstance.Database("__mocks__\\" + name + ".sqlite3"));
	}

	close(_callback: ErrorCallback): void {
		return;
	}

	transaction(callback: TransactionCallback, errorCallback: ErrorCallback): void {
		const transaction: iTransactionInternal = new Transaction(this.sqLiteDb);
		transaction.onTransactionStart(callback);
		transaction.onTransactionError(errorCallback);
	}

	getName(): string {
		return this.name;
	}


}