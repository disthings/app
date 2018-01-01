import {ErrorCallback, QueryResultCallback} from "../types";

export interface iTransaction {
	executeSql(sqlStatement: string, args: Array<any>, callback: QueryResultCallback): void;
	onTransactionStart(callback: Function): void;
	onTransactionError(errorCallback: ErrorCallback): void;
}