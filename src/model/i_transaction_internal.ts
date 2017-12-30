import {ErrorCallback} from "../types";

export interface iTransactionInternal {
	onTransactionStart(callback: Function): void;
	onTransactionError(errorCallback: ErrorCallback): void;
}