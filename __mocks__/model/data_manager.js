"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../src/types");
const settings_manager_1 = require("./settings_manager");
const sqlite_database_1 = require("./sqlite_database");
class DataManager {
    constructor() {
        this.databases = new Map();
        this.clientPeripherals = [];
        this.serverPeripherals = [];
        this.settings = settings_manager_1.SettingsManager.getStartingSettings().dataManager;
        this.dataRetentionInterval = this.settings.dataRetentionInterval;
        this.activateDataRetentionInterval();
    }
    activateDataRetentionInterval() {
        setInterval(() => {
            this.clientPeripherals.forEach((peripheralParts) => {
                let peripheral = peripheralParts.peripheral;
                let db = this.getDatabase(peripheralParts.key);
                db.transaction((transaction) => {
                    this.insertDataIntoDataTable(peripheral, peripheral.getOldData(), transaction, (_tx, _result) => {
                        peripheral.deleteOldDataFromMemory();
                    });
                }, (error) => {
                    throw error;
                });
            });
        }, this.dataRetentionInterval);
    }
    doesDatabaseExist(name) {
        return this.databases.get(name) !== undefined;
    }
    createDatabase(name) {
        if (!this.doesDatabaseExist(name)) {
            this.databases.set(name, new sqlite_database_1.SQLiteDatabase(name));
        }
        else {
            throw new Error("Database name already exists");
        }
        return this.getDatabase(name);
    }
    getDatabase(name) {
        if (!this.doesDatabaseExist(name)) {
            throw new Error("Database does not exist");
        }
        return this.databases.get(name);
    }
    closeDatabase(name, errorCallback) {
        if (!this.doesDatabaseExist(name)) {
            throw new Error("Database does not exist");
        }
        this.getDatabase(name).close(errorCallback);
    }
    getClientPeripherals() {
        return this.clientPeripherals;
    }
    getServerPeripherals() {
        return this.serverPeripherals;
    }
    addClientPeripheral(peripheralPartsContainer) {
        this.addPeripheral(peripheralPartsContainer, types_1.PeripheralType.CLIENT);
    }
    addServerPeripheral(peripheralPartsContainer) {
        this.addPeripheral(peripheralPartsContainer, types_1.PeripheralType.SERVER);
    }
    addPeripheral(peripheralPartsContainer, type) {
        const peripheral = peripheralPartsContainer.peripheral;
        const name = peripheral.getName();
        if (!this.doesDatabaseExist(name)) {
            if (type === types_1.PeripheralType.CLIENT) {
                this.clientPeripherals.push(peripheralPartsContainer);
            }
            else if (type === types_1.PeripheralType.SERVER) {
                this.serverPeripherals.push(peripheralPartsContainer);
            }
            else {
                throw new Error("Invalid peripheral type: " + type);
            }
        }
        else {
            throw new Error("Duplicate peripheral name: " + name);
        }
    }
    createDbTables(peripheral, transaction, callback) {
        transaction.executeSql("CREATE TABLE '" + peripheral.getName() + "_" + types_1.DatabaseTable.DATA + "' (dataPackage BLOB);", [], () => {
            transaction.executeSql("CREATE TABLE '" + peripheral.getName() + "_" + types_1.DatabaseTable.BACKUP + "' (dataPackage BLOB);", [], callback);
        });
    }
    insertDataIntoDataTable(peripheral, data, transaction, callback) {
        this.insertDataIntoDb(peripheral, types_1.DatabaseTable.DATA, data, transaction, callback);
    }
    insertDataIntoBackupTable(peripheral, data, transaction, callback) {
        this.insertDataIntoDb(peripheral, types_1.DatabaseTable.BACKUP, data, transaction, callback);
    }
    insertDataIntoDb(peripheral, table, data, transaction, callback) {
        const values = JSON.stringify(data);
        if (values !== "") {
            let query = "INSERT INTO '" + peripheral.getName() + "_" + table + "' (dataPackage) VALUES ('" + values + "');";
            transaction.executeSql(query, [], callback);
        }
        else {
            callback(new Error("No values to enter"));
        }
    }
    restoreAllDataFromDataTable(peripheral, transaction, callback) {
        this.restoreAllDataFromTable(peripheral, types_1.DatabaseTable.DATA, transaction, callback);
    }
    restoreAllDataFromBackupTable(peripheral, transaction, callback) {
        this.restoreAllDataFromTable(peripheral, types_1.DatabaseTable.BACKUP, transaction, callback);
    }
    restoreAllDataFromTable(peripheral, table, transaction, callback) {
        const query = "SELECT * FROM '" + peripheral.getName() + "_" + table + "';";
        transaction.executeSql(query, [], (result) => {
            let data = [];
            const rows = result.rows;
            if (rows) {
                for (let i = 0; i < rows.length; i++) {
                    let row = rows.item(i).dataPackage;
                    let parsedRow = JSON.parse(row);
                    data = data.concat(parsedRow);
                }
            }
            callback(data);
        });
    }
    emptyDataTable(peripheral, transaction, callback) {
        const query = "DELETE FROM '" + peripheral.getName() + "_DATA" + "';";
        transaction.executeSql(query, [], callback);
    }
    emptyBackupTable(peripheral, transaction, callback) {
        const query = "DELETE FROM '" + peripheral.getName() + "_BACKUP" + "';";
        transaction.executeSql(query, [], callback);
    }
}
exports.DataManager = DataManager;
//# sourceMappingURL=data_manager.js.map