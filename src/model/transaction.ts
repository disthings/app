import {iTransaction} from "./i_transaction";


/*
A wrapper class around the transaction. Its original purpose was to abstract two different libraries into one for two
environments (node and react native), but that proved problematic. It will be removed and won't affect the API for
creating a peripheral.
 */
export class Transaction implements iTransaction {

	private sqLiteDb: any;
	private transaction: any;

	constructor(sqLiteDb: any, onStartCallback: Function, onErrorCallback: Function) {

		this.sqLiteDb = sqLiteDb;
		this.sqLiteDb.transaction((transaction: any) => {
			this.transaction = transaction;
			onStartCallback(this);
		}, onErrorCallback);
	}

	executeSql(sqlStatement: string, args: Array<any>, callback: Function): void {
		this.transaction.executeSql(sqlStatement, args, (transaction: iTransaction, result: any) => {
			if(callback) {
				callback(transaction, result);
			}
		}, (transaction: any, error: Error) => {
			if(callback) {
				callback(transaction, error);
			}
			else {
				console.error(error);
			}
		});
	}
}