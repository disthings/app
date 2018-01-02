import {ErrorCallback} from "../../src/types";
import {iTransaction} from "./MOCK_i_transaction";

export class Transaction implements iTransaction {

	private sqLiteDb: any;
	private transaction: any;
	private onTransactionStartCallback: Function;
	private onTransactionErrorCallback: Function;

	constructor(sqLiteDb: any) {

		this.sqLiteDb = sqLiteDb;

		this.sqLiteDb.beginTransaction((error: Error, transaction: any) => {
			if(error) {
				console.log("Transaction constructor", error);
			}
			this.transaction = transaction;
			this.onTransactionStartCallback(this);
		}, this.onTransactionErrorCallback);
	}

	executeSql(sqlStatement: string, args: Array<any>, callback: Function): void {
		this.transaction.run(sqlStatement, args, callback);
	}

	all(sqlStatement: string, args: Array<any>, callback: Function): void {
		this.transaction.all(sqlStatement, args, callback);
	}

	commit(callback: ErrorCallback): void {
		this.transaction.commit(callback);
	}

	onTransactionStart(callback: Function): void {
		this.onTransactionStartCallback = callback;
	}

	onTransactionError(errorCallback: ErrorCallback): void {
		this.onTransactionErrorCallback = errorCallback;
	}
}