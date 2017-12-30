import {ErrorCallback, TransactionCallback} from "../types";

export interface iSQLiteDatabase {
	close(callback: ErrorCallback): void;
	getName(): string;
	transaction(callback: TransactionCallback, errorCallback: ErrorCallback): void;
}