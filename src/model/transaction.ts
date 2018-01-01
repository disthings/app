import {ErrorCallback, QueryResultCallback} from "../types";
import {iTransaction} from "./i_transaction";

export class Transaction implements iTransaction {

	private sqLiteDb: any;
	private transaction: any;
	private onTransactionStartCallback: Function;
	private onTransactionErrorCallback: Function;

	constructor(sqLiteDb: any) {

		this.sqLiteDb = sqLiteDb;
		this.sqLiteDb.transaction((transaction: any) => {
			this.transaction = transaction;
			this.onTransactionStartCallback(this);
		}, this.onTransactionErrorCallback);
	}

	executeSql(sqlStatement: string, args: Array<any>, callback: QueryResultCallback): void {
		this.transaction.executeSql(sqlStatement, args, (transaction: iTransaction, result: any) => {
			if(callback) {
				callback(transaction, result);
			}
		}, (transaction: any, error: Error) => {
			if(callback) {
				callback(transaction, error);
			}
			else {
				throw error;
			}
		});
	}

	onTransactionStart(callback: Function): void {
		this.onTransactionStartCallback = callback;
	}

	onTransactionError(errorCallback: ErrorCallback): void {
		this.onTransactionErrorCallback = errorCallback;
	}
}