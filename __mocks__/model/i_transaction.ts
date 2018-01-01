export interface iTransaction {
	executeSql(sqlStatement: string, args: Array<any>, callback: Function): void;
}