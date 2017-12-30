import {QueryResultCallback} from "../types";

export interface iTransaction {
	executeSql(sqlStatement: string, args: Array<any>, callback: QueryResultCallback): void;
}