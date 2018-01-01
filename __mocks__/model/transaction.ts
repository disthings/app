import {ErrorCallback} from "../../src/types";
import {iTransaction} from "./i_transaction";
import {iTransactionInternal} from "../../src/model/i_transaction_internal";

export class Transaction implements iTransaction, iTransactionInternal {

	private sqLiteDb: any;
	private transaction: any;
	private onTransactionStartCallback: Function;
	private onTransactionErrorCallback: Function;

	constructor(sqLiteDb: any) {

		this.sqLiteDb = sqLiteDb;

		this.sqLiteDb.beginTransaction((error: Error, transaction: any) => {
			if(error) {
				throw error;
			}
			this.transaction = transaction;
			this.onTransactionStartCallback(this);
		}, this.onTransactionErrorCallback);
	}

	executeSql(sqlStatement: string, args: Array<any>, callback: Function): void {
		this.transaction.run(sqlStatement, args, (error: Error) => {
			if(error) {
				callback(error);
			}
			this.transaction.commit((error: Error) => {
				if(error) {
					callback(error);
				}
				callback();
			});
		});
	}

	onTransactionStart(callback: Function): void {
		this.onTransactionStartCallback = callback;
	}

	onTransactionError(errorCallback: ErrorCallback): void {
		this.onTransactionErrorCallback = errorCallback;
	}
}