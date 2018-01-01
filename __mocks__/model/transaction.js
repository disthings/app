"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Transaction {
    constructor(sqLiteDb) {
        this.sqLiteDb = sqLiteDb;
        this.sqLiteDb.beginTransaction((error, transaction) => {
            if (error) {
                console.log("Transaction constructor", error);
            }
            this.transaction = transaction;
            this.onTransactionStartCallback(this);
        }, this.onTransactionErrorCallback);
    }
    executeSql(sqlStatement, args, callback) {
        this.transaction.run(sqlStatement, args, callback);
    }
    commit(callback) {
        this.transaction.commit(callback);
    }
    onTransactionStart(callback) {
        this.onTransactionStartCallback = callback;
    }
    onTransactionError(errorCallback) {
        this.onTransactionErrorCallback = errorCallback;
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map