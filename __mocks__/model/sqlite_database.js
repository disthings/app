"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SQLiteInstance = require("sqlite3").verbose();
const TransactionDatabase = require("sqlite3-transactions").TransactionDatabase;
const transaction_1 = require("./transaction");
class SQLiteDatabase {
    constructor(name) {
        this.name = name;
        this.sqLiteDb = new TransactionDatabase(new SQLiteInstance.Database("__mocks__\\" + name + ".sqlite3"));
    }
    close(_callback) {
        return;
    }
    transaction(callback, errorCallback) {
        const transaction = new transaction_1.Transaction(this.sqLiteDb);
        transaction.onTransactionStart(callback);
        transaction.onTransactionError(errorCallback);
    }
    getName() {
        return this.name;
    }
}
exports.SQLiteDatabase = SQLiteDatabase;
//# sourceMappingURL=sqlite_database.js.map