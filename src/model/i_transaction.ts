import {ErrorCallback} from "../types";

export interface iTransaction {
	executeSql(sqlStatement: string, args: Array<any>, callback: Function): void;
	onTransactionStart(callback: Function): void;
	onTransactionError(errorCallback: ErrorCallback): void;
}