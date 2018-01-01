"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Transaction {
    constructor(sqLiteDb) {
        this.sqLiteDb = sqLiteDb;
        this.sqLiteDb.beginTransaction((error, transaction) => {
            if (error) {
                throw error;
            }
            this.transaction = transaction;
            this.onTransactionStartCallback(this);
        }, this.onTransactionErrorCallback);
    }
    executeSql(sqlStatement, args, callback) {
        this.transaction.run(sqlStatement, args, (error) => {
            if (error) {
                callback(error);
            }
            this.transaction.commit((error) => {
                if (error) {
                    callback(error);
                }
                callback();
            });
        });
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