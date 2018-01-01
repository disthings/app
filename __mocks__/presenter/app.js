"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sync_manager_1 = require("../model/sync_manager");
const data_manager_1 = require("../model/data_manager");
const types_1 = require("../../src/types");
const forEachAsync_1 = require("../../src/forEachAsync");
const logger_1 = require("../../src/logger");
const default_values_1 = require("../../src/defaults/default_values");
const settings_manager_1 = require("../model/settings_manager");
class App {
    constructor() {
        this.tryCounter = 0;
        this.isWaiting = true;
        this.isSocketReady = false;
        this.didSettingsLoad = false;
        this.currentViewType = types_1.ViewType.MAIN;
        this.currentPeripheral = default_values_1.DefaultValues.EMPTY_PERIPHERAL;
        this.subscriberID = "APP";
        this.dataManager = new data_manager_1.DataManager();
        settings_manager_1.SettingsManager.getRuntimeSettings((_error, result) => {
            if (result) {
                this.settings = result;
            }
            else {
                this.settings = settings_manager_1.SettingsManager.getStartingSettings();
                settings_manager_1.SettingsManager.setRuntimeSettings(this.settings, (_error) => {
                    logger_1.Logger.log(_error);
                });
            }
            this.maxTryCounter = this.settings.maxTryCounter;
            this.dataRequestInterval = this.settings.dataRequestInterval;
            this.didSettingsLoad = true;
            if (this.onReadyToRenderCallback) {
                this.onReadyToRenderCallback(this.settings.webSocket.host);
            }
            if (this.settings.webSocket.host) {
                this.activateSynchronization();
            }
        });
    }
    activateSynchronization() {
        this.syncManager = new sync_manager_1.SyncManager();
        this.activateListeners();
    }
    activateListeners() {
        this.syncManager.onSocketDisconnect(() => {
            this.isSocketReady = false;
            this.deactivateInterval();
            this.isWaiting = true;
        }, this.subscriberID);
        this.syncManager.onSocketReady(() => {
            this.isSocketReady = true;
            this.isWaiting = false;
            this.activateInterval();
        }, this.subscriberID);
        this.subscribeToServerAllPeripheralsData();
        this.subscribeToGetClientAllPeripheralsData();
        this.subscribeToClientAllPeripheralsDataReceived();
        this.subscribeToServerPeripheralData();
    }
    activateInterval() {
        this.isWaiting = false;
        this.takeViewAction();
        this.loopID = setInterval(() => {
            this.takeViewAction();
        }, this.dataRequestInterval);
    }
    takeViewAction() {
        switch (this.currentViewType) {
            case types_1.ViewType.MAIN:
                this.takeMainViewAction();
                break;
            case types_1.ViewType.PERIPHERAL:
                if (this.currentPeripheral.getType() === types_1.PeripheralType.SERVER) {
                    this.takeServerPeripheralViewAction();
                }
                break;
            case types_1.ViewType.SETTINGS:
                break;
            default:
                logger_1.Logger.error("No such screen");
        }
    }
    deactivateInterval() {
        clearInterval(this.loopID);
        delete this.loopID;
    }
    takeMainViewAction() {
        if (this.isReadyForInterval()) {
            this.waitForServer();
            this.getServerAllPeripheralsData();
        }
        else if (this.isSocketReady) {
            this.tryCounter++;
        }
        if (this.tryCounter === this.maxTryCounter && this.isSocketReady) {
            this.stopWaitingForServer();
            this.tryCounter = 0;
        }
    }
    takeServerPeripheralViewAction() {
        if (this.isReadyForInterval()) {
            this.waitForServer();
            this.getServerPeripheralViewData();
        }
        else if (this.isSocketReady) {
            this.tryCounter++;
        }
        if (this.tryCounter === this.maxTryCounter && this.isSocketReady) {
            this.stopWaitingForServer();
            this.tryCounter = 0;
        }
    }
    stopWaitingForServer() {
        this.isWaiting = false;
    }
    waitForServer() {
        this.isWaiting = true;
    }
    isReadyForInterval() {
        return this.isSocketReady && !this.isWaiting && this.didSettingsLoad;
    }
    onReadyToRender(callback) {
        this.onReadyToRenderCallback = callback;
    }
    addClientPeripheral(peripheralPartsContainer) {
        this.waitForServer();
        let peripheral = peripheralPartsContainer.peripheral;
        this.dataManager.addClientPeripheral(peripheralPartsContainer);
        const db = this.dataManager.createDatabase(peripheral.getName());
        db.transaction((transaction) => {
            this.dataManager.createDbTables(peripheral, transaction, (_transaction, _result) => {
                this.stopWaitingForServer();
            });
        }, (error) => {
            logger_1.Logger.error(error);
        });
    }
    addServerPeripheral(peripheralPartsContainer) {
        this.waitForServer();
        let peripheral = peripheralPartsContainer.peripheral;
        peripheral.subscribeToEvent("command", (commandArgs) => {
            this.syncManager.sendMessage({
                type: "serverPeripheralCommand",
                data: [peripheral.getName()].concat(commandArgs)
            });
        }, this.subscriberID);
        this.dataManager.addServerPeripheral(peripheralPartsContainer);
        this.stopWaitingForServer();
    }
    removePeripheral(peripheral) {
        let arrayToBeSearched = this.getArrayBasedOnPeripheralType(peripheral.getType());
        let found = false;
        let arrayLength = arrayToBeSearched.length;
        let i = 0;
        peripheral.unsubscribeFromEvent("command", this.subscriberID);
        while (!found && i < arrayLength) {
            let peripheralParts = arrayToBeSearched[i];
            let peripheral = peripheralParts.peripheral;
            if (found = peripheral.getName() === peripheral.getName()) {
                arrayToBeSearched.splice(i, 1);
            }
            i++;
        }
        this.dataManager.closeDatabase(peripheral.getName(), (error) => {
            logger_1.Logger.error(error);
        });
    }
    getArrayBasedOnPeripheralType(peripheralType) {
        let arrayToBeSearched = [];
        switch (peripheralType) {
            case types_1.PeripheralType.CLIENT:
                arrayToBeSearched = this.getClientPeripherals();
                break;
            case types_1.PeripheralType.SERVER:
                arrayToBeSearched = this.getServerPeripherals();
                break;
            default:
                logger_1.Logger.error("No such peripheral type.");
        }
        return arrayToBeSearched;
    }
    getServerAllPeripheralsData() {
        const message = {
            "type": "getServerAllPeripheralsData",
            "data": this.getServerPeripheralsRequestDataPackages()
        };
        this.syncManager.sendMessage(message);
    }
    subscribeToServerAllPeripheralsData() {
        this.syncManager.subscribeToMessage("serverAllPeripheralsData", (message) => {
            this.addServerPeripheralsData(message.data);
            this.sendServerAllPeripheralsDataReceived();
        }, this.subscriberID);
    }
    sendServerAllPeripheralsDataReceived() {
        this.syncManager.sendMessage({
            "type": "serverAllPeripheralsDataReceived",
            "data": []
        });
    }
    subscribeToGetClientAllPeripheralsData() {
        this.syncManager.subscribeToMessage("getClientAllPeripheralsData", (message) => {
            this.sendClientPeripheralsData(message);
        }, this.subscriberID);
    }
    sendClientPeripheralsData(_receivedMessage) {
        this.getClientAllPeripheralsViewData((data) => {
            const message = {
                "type": "clientAllPeripheralsData",
                "data": data
            };
            this.syncManager.sendMessage(message);
        });
    }
    subscribeToClientAllPeripheralsDataReceived() {
        this.syncManager.subscribeToMessage("clientAllPeripheralsDataReceived", (_message) => {
            this.stopWaitingForServer();
        }, this.subscriberID);
    }
    subscribeToServerPeripheralData() {
        this.syncManager.subscribeToMessage("serverPeripheralData", (message) => {
            this.addServerPeripheralsData(message.data);
            this.sendServerPeripheralDataReceived();
        }, this.subscriberID);
    }
    sendServerPeripheralDataReceived() {
        this.syncManager.sendMessage({
            "type": "serverPeripheralDataReceived",
            "data": []
        });
    }
    getClientAllPeripheralsViewData(callback) {
        const responseDataPackages = [];
        const clientPeripherals = this.getClientPeripherals();
        forEachAsync_1.forEachAsync(clientPeripherals, (peripheralPartsContainer, _indexOrKey, next) => {
            let peripheral = peripheralPartsContainer.peripheral;
            let peripheralName = peripheral.getName();
            let db = this.dataManager.getDatabase(peripheralName);
            db.transaction((transaction) => {
                this.dataManager.restoreAllDataFromDataTable(peripheral, transaction, (transaction, result) => {
                    responseDataPackages.push({
                        "name": peripheralName,
                        "data": result,
                        "peripheralType": types_1.PeripheralType.CLIENT,
                        "dataSet": types_1.DataSet.VIEW
                    });
                    this.dataManager.emptyDataTable(peripheral, transaction, (_transaction, _result) => {
                        next();
                    });
                });
            }, (error) => {
                logger_1.Logger.error("getClientAllPeripheralsViewData", error);
            });
        }, () => {
            callback(responseDataPackages);
        });
    }
    getServerPeripheralViewData() {
        this.syncManager.sendMessage({
            "type": "getServerPeripheralData",
            "data": [{
                    "name": this.currentPeripheral.getName(),
                    "timestamp": Date.now(),
                    "data": [],
                    "peripheralType": types_1.PeripheralType.SERVER,
                    "dataSet": types_1.DataSet.VIEW
                }]
        });
    }
    getPeripheralPartsContainerFromName(name, peripheralType) {
        let found = false;
        const arrayLength = this.getClientPeripherals().length;
        let i = 0;
        let foundPeripheralParts = default_values_1.DefaultValues.PERIPHERAL_PARTS_CONTAINER;
        const arrayToSearch = this.getArrayBasedOnPeripheralType(peripheralType);
        while (!found && i < arrayLength) {
            let peripheralParts = arrayToSearch[i];
            let currentPeripheral = peripheralParts.peripheral;
            if (found = currentPeripheral.getName() === name) {
                foundPeripheralParts = peripheralParts;
            }
            i++;
        }
        return foundPeripheralParts;
    }
    getServerPeripheralsRequestDataPackages() {
        let requestDataPackage;
        const requestDataPackagesList = [];
        let serverPeripheral;
        this.getServerPeripherals().forEach((peripheralContainer) => {
            serverPeripheral = peripheralContainer.peripheral;
            requestDataPackage = serverPeripheral.getRequestDataPackage();
            requestDataPackagesList.push(requestDataPackage);
        });
        return requestDataPackagesList;
    }
    getClientPeripherals() {
        return this.dataManager.getClientPeripherals();
    }
    getServerPeripherals() {
        return this.dataManager.getServerPeripherals();
    }
    addServerPeripheralsData(data) {
        data.forEach((dataPackage) => {
            let peripheralName = dataPackage.name;
            let peripheralParts = this.getPeripheralPartsContainerFromName(peripheralName, types_1.PeripheralType.SERVER);
            let peripheral = peripheralParts.peripheral;
            peripheral.setData(dataPackage.data);
        });
    }
    getCurrentViewType() {
        return this.currentViewType;
    }
    setCurrentViewType(screenType) {
        this.currentViewType = screenType;
    }
    setCurrentPeripheral(peripheral) {
        this.currentPeripheral = peripheral;
    }
    setNewIP(ip) {
        const host = "ws://" + ip;
        settings_manager_1.SettingsManager.getRuntimeSettings((_error, result) => {
            const currentSettings = result;
            currentSettings.webSocket.host = host;
            settings_manager_1.SettingsManager.setRuntimeSettings(currentSettings, () => {
                this.settings = currentSettings;
                this.activateSynchronization();
            });
        });
    }
    setAppState(state) {
        this.getClientPeripherals().forEach((peripheralPartsContainer) => {
            const backupDB = this.dataManager.getDatabase(peripheralPartsContainer.key);
            const peripheral = peripheralPartsContainer.peripheral;
            backupDB.transaction((backupTransaction) => {
                if (state === "active") {
                    this.dataManager.restoreAllDataFromBackupTable(peripheral, backupTransaction, (backupTransaction, result) => {
                        if (result) {
                            peripheral.setData(peripheral.getData().concat(result));
                            this.dataManager.emptyBackupTable(peripheral, backupTransaction, (_transaction, _result) => {
                            });
                        }
                    });
                }
                else {
                    this.dataManager.insertDataIntoBackupTable(peripheral, peripheral.getData(), backupTransaction, (_transaction, _results) => {
                        peripheral.initializeData();
                    });
                }
            }, (error) => {
                console.log(error);
            });
        });
    }
}
exports.App = App;
//# sourceMappingURL=app.js.map