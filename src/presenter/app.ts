import {iApp} from "./i_app";
import {iSyncManager} from "../model/i_synchronization_manager";
import {SyncManager} from "../model/synchronization_manager";
import {iDataManager} from "../model/i_data_manager";
import {DataManager} from "../model/data_manager";
import {Message, UserDataStructure} from "../types";
import {
	DataSet, PeripheralPartsContainer, PeripheralType, RequestDataPackage,
	ResponseDataPackage, Settings, ViewType
} from "../types";
import {iSQLiteDatabase} from "../model/i_sqlite_database";
import {forEachAsync} from "../forEachAsync";
import {iTransaction} from "../model/i_transaction";
import Timer = NodeJS.Timer;
import {DefaultValues} from "../defaults/default_values";
import {Peripheral} from "../model/peripheral";
import {SettingsManager} from "../model/settings_manager";
import {StartingSettings} from "../starting_settings";

export class App implements iApp {

	private syncManager: iSyncManager;
	private dataManager: iDataManager;
	private currentViewType: ViewType;
	private currentPeripheral: Peripheral;
	private isWaiting: boolean;
	private isSocketReady: boolean;
	private didSettingsLoad: boolean;
	private tryCounter: number = 0;
	private loopID: Timer;
	private maxTryCounter: number;
	private dataRequestInterval: number;
	private subscriberID: string;
	private settings: StartingSettings;
	private onReadyToRenderCallback: Function;

	constructor() {

		this.isWaiting = true;
		this.isSocketReady = false;
		this.didSettingsLoad = false;

		this.currentViewType = ViewType.MAIN;
		this.currentPeripheral = DefaultValues.EMPTY_PERIPHERAL;
		this.subscriberID = "APP";

		this.dataManager = new DataManager();

		SettingsManager.getRuntimeSettings((_error: Error, result: StartingSettings) => {

			if(result) {
				this.settings = result;
			}
			else {
				this.settings = SettingsManager.getStartingSettings();
				SettingsManager.setRuntimeSettings(this.settings, (_error: Error) => {
					console.log(_error);
				});
			}

			this.maxTryCounter = this.settings.maxTryCounter;
			this.dataRequestInterval = this.settings.dataRequestInterval;
			this.didSettingsLoad = true;
			this.onReadyToRenderCallback(this.settings.webSocket.host);

			if(this.settings.webSocket.host) {
				this.activateSynchronization();
			}
		});

	}

	private activateSynchronization(): void {
		this.syncManager = new SyncManager();
		this.activateListeners();
	}

	private activateListeners(): void {
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

	private activateInterval(): void {
		this.isWaiting = false;
		this.takeViewAction();
		this.loopID = setInterval(() => {
			this.takeViewAction();
		}, this.dataRequestInterval);
	}

	private takeViewAction(): void {
		switch (this.currentViewType) {
			case ViewType.MAIN:
				this.takeMainViewAction();
				break;
			case ViewType.PERIPHERAL:
				if(this.currentPeripheral.getType() === PeripheralType.SERVER) {
					this.takeServerPeripheralViewAction();
				}
				break;
			case ViewType.SETTINGS:

				break;
			default:
				console.error("No such screen");
		}
	}

	private deactivateInterval(): void {
		clearInterval(this.loopID);
		delete this.loopID;
	}

	private takeMainViewAction(): void {
		if(this.isReadyForInterval()) {
			this.waitForServer();
			this.getServerAllPeripheralsData();
		}
		else if(this.isSocketReady) {
			this.tryCounter++;
		}

		if(this.tryCounter === this.maxTryCounter && this.isSocketReady) {
			this.stopWaitingForServer();
			this.tryCounter = 0;
		}
	}

	private takeServerPeripheralViewAction(): void {
		if(this.isReadyForInterval()) {
			this.waitForServer();
			this.getServerPeripheralViewData();
		}
		else if(this.isSocketReady) {
			this.tryCounter++;
		}

		if(this.tryCounter === this.maxTryCounter && this.isSocketReady) {
			this.stopWaitingForServer();
			this.tryCounter = 0;
		}
	}

	private stopWaitingForServer(): void {
		this.isWaiting = false;
	}

	private waitForServer(): void {
		this.isWaiting = true;
	}

	isReadyForInterval(): boolean {
		return this.isSocketReady && !this.isWaiting && this.didSettingsLoad;
	}

	onReadyToRender(callback: Function): void {
		this.onReadyToRenderCallback = callback;
	}

	addClientPeripheral(peripheralPartsContainer: PeripheralPartsContainer): void {
		this.waitForServer();

		let peripheral: Peripheral = peripheralPartsContainer.peripheral as Peripheral;

		this.dataManager.addPeripheralToMemory(peripheralPartsContainer);

		const db: iSQLiteDatabase = this.dataManager.createDatabase(peripheral.getName());

		db.transaction((transaction: iTransaction) => {

			this.dataManager.createDbTables(peripheral, transaction, (_transaction: iTransaction, _result: any) => {
				this.stopWaitingForServer();
			});
		}, (error: Error) => {
			console.error(error);
		});
	}

	addServerPeripheral(peripheralPartsContainer: PeripheralPartsContainer): void {
		this.waitForServer();

		let peripheral: Peripheral = peripheralPartsContainer.peripheral as Peripheral;

		peripheral.subscribeToEvent("command", (commandArgs: Array<any>) => {
			this.syncManager.sendMessage({
				type: "serverPeripheralCommand",
				data: [peripheral.getName()].concat(commandArgs)
			});
		}, this.subscriberID);

		this.dataManager.addPeripheralToMemory(peripheralPartsContainer);
		this.stopWaitingForServer();
	}

	removePeripheral(peripheral: Peripheral): void {
		let arrayToBeSearched: Array<PeripheralPartsContainer> = this.getArrayBasedOnPeripheralType(peripheral.getType());

		let found: boolean = false;
		let arrayLength: number = arrayToBeSearched.length;
		let i: number = 0;

		peripheral.unsubscribeFromEvent("command", this.subscriberID);

		while (!found && i < arrayLength) {
			let peripheralParts: PeripheralPartsContainer = arrayToBeSearched[i];
			let peripheral: Peripheral = peripheralParts.peripheral as Peripheral;
			if (found = peripheral.getName() === peripheral.getName()) {
				arrayToBeSearched.splice(i, 1);
			}
			i++;
		}

		this.dataManager.closeDatabase(peripheral.getName(), (error: Error) => {
			console.error(error);
		});
	}

	private getArrayBasedOnPeripheralType(peripheralType: PeripheralType): Array<PeripheralPartsContainer> {
		let arrayToBeSearched: Array<PeripheralPartsContainer> = [];

		switch (peripheralType) {
			case PeripheralType.CLIENT:
				arrayToBeSearched = this.getClientPeripherals();
				break;
			case PeripheralType.SERVER:
				arrayToBeSearched = this.getServerPeripherals();
				break;
			default:
				console.error("No such peripheral type.");
		}

		return arrayToBeSearched;
	}

	private getServerAllPeripheralsData(): void {
		const message: Message = {
			"type": "getServerAllPeripheralsData",
			"data": this.getServerPeripheralsRequestDataPackages()
		};

		this.syncManager.sendMessage(message);
	}

	private subscribeToServerAllPeripheralsData(): void {
		this.syncManager.subscribeToMessage("serverAllPeripheralsData", (message: Message) => {
			this.addServerPeripheralsData(message.data);
			this.sendServerAllPeripheralsDataReceived();
		}, this.subscriberID);
	}

	private sendServerAllPeripheralsDataReceived(): void {
		this.syncManager.sendMessage({
			"type": "serverAllPeripheralsDataReceived",
			"data": []
		});
	}

	private subscribeToGetClientAllPeripheralsData(): void {
		this.syncManager.subscribeToMessage("getClientAllPeripheralsData", (message: Message) => {
			this.sendClientPeripheralsData(message);
		}, this.subscriberID);
	}

	private sendClientPeripheralsData(_receivedMessage: Message): void {

		this.getClientAllPeripheralsViewData((data: any) => {
			const message: Message = {
				"type": "clientAllPeripheralsData",
				"data": data
			};
			this.syncManager.sendMessage(message);
		});
	}

	private subscribeToClientAllPeripheralsDataReceived(): void {
		this.syncManager.subscribeToMessage("clientAllPeripheralsDataReceived", (_message: Message) => {
			this.stopWaitingForServer();
		}, this.subscriberID);
	}



	private subscribeToServerPeripheralData(): void {
		this.syncManager.subscribeToMessage("serverPeripheralData", (message: Message) => {
			this.addServerPeripheralsData(message.data);
			this.sendServerPeripheralDataReceived();
		}, this.subscriberID);
	}

	private sendServerPeripheralDataReceived(): void {
		this.syncManager.sendMessage({
			"type": "serverPeripheralDataReceived",
			"data": []
		});
	}

	private getClientAllPeripheralsViewData(callback: Function): void {

		const responseDataPackages: Array<ResponseDataPackage> = [];
		const clientPeripherals: Array<PeripheralPartsContainer> = this.getClientPeripherals();


		forEachAsync(clientPeripherals, (peripheralPartsContainer: PeripheralPartsContainer, _indexOrKey: number | string, next: () => void) => {

			let peripheral: Peripheral = peripheralPartsContainer.peripheral as Peripheral;
			let peripheralName: string = peripheral.getName();
			let db: iSQLiteDatabase = this.dataManager.getDatabase(peripheralName);
			db.transaction((transaction: iTransaction) => {

				this.dataManager.restoreAllDataFromDataTable(peripheral, transaction, (transaction: iTransaction, result: Array<UserDataStructure>) => {
					responseDataPackages.push({
						"name": peripheralName,
						"data": result,
						"peripheralType": PeripheralType.CLIENT,
						"dataSet": DataSet.VIEW
					});

					this.dataManager.emptyDataTable(peripheral, transaction, (_transaction: iTransaction, _result: any) => {
						next();
					});
				});

				}, (error: Error) => {
				console.error("getClientAllPeripheralsViewData", error);
			});
		},() => {
			callback(responseDataPackages);
		});
	}

	private getServerPeripheralViewData(): void {
		this.syncManager.sendMessage({
			"type": "getServerPeripheralData",
			"data": [{
				"name": this.currentPeripheral.getName(),
				"timestamp": Date.now(),
				"data": [],
				"peripheralType": PeripheralType.SERVER,
				"dataSet": DataSet.VIEW
			}]
		});
	}

	// private getClientPeripheralFromName(name: string): Peripheral {
	// 	const peripheralContainer: PeripheralPartsContainer = this.getPeripheralPartsContainerFromName(name, PeripheralType.CLIENT);
	// 	return peripheralContainer.peripheral as Peripheral;
	// }

	private getPeripheralPartsContainerFromName(name: string, peripheralType: PeripheralType): PeripheralPartsContainer {
		let found: boolean = false;
		const arrayLength: number = this.getClientPeripherals().length;
		let i: number = 0;
		let foundPeripheralParts: PeripheralPartsContainer = DefaultValues.PERIPHERAL_PARTS_CONTAINER;
		const arrayToSearch: Array<PeripheralPartsContainer> = this.getArrayBasedOnPeripheralType(peripheralType);


		while (!found && i < arrayLength) {
			let peripheralParts: PeripheralPartsContainer = arrayToSearch[i];
			let currentPeripheral: Peripheral = peripheralParts.peripheral as Peripheral;
			if (found = currentPeripheral.getName() === name) {
				foundPeripheralParts = peripheralParts;
			}
			i++;
		}
		return foundPeripheralParts;
	}

	private getServerPeripheralsRequestDataPackages(): Array<RequestDataPackage> {
		let requestDataPackage: RequestDataPackage;
		const requestDataPackagesList: Array<RequestDataPackage> = [];
		let serverPeripheral: Peripheral;

		this.getServerPeripherals().forEach((peripheralContainer: PeripheralPartsContainer) => {
			serverPeripheral = peripheralContainer.peripheral as Peripheral;
			requestDataPackage = serverPeripheral.getRequestDataPackage();
			requestDataPackagesList.push(requestDataPackage);
		});

		return requestDataPackagesList;
	}

	getClientPeripherals(): Array<PeripheralPartsContainer> {
		return this.dataManager.getClientPeripherals();
	}

	getServerPeripherals(): Array<PeripheralPartsContainer> {
		return this.dataManager.getServerPeripherals();
	}

	private addServerPeripheralsData(data: Array<any>): void {
		data.forEach((dataPackage: any) => {
			let peripheralName: string = dataPackage.name;
			let peripheralParts: PeripheralPartsContainer = this.getPeripheralPartsContainerFromName(peripheralName, PeripheralType.SERVER);
			let peripheral: Peripheral = peripheralParts.peripheral as Peripheral;
			peripheral.setData(dataPackage.data);
		});
	}

	getCurrentViewType(): ViewType {
		return this.currentViewType;
	}

	setCurrentViewType(screenType: ViewType): void {
		this.currentViewType = screenType;
	}

	setCurrentPeripheral(peripheral: Peripheral): void {
		this.currentPeripheral = peripheral;
	}

	setNewIP(ip: string): void {
		const host: string = "ws://" + ip;
		SettingsManager.getRuntimeSettings((_error: Error, result: Settings) => {
			const currentSettings: Settings = result;
			currentSettings.webSocket.host = host;
			SettingsManager.setRuntimeSettings(currentSettings, () => {
				this.settings = currentSettings;
				this.activateSynchronization();
			});
		});
	}

	setAppState(state: string): void {
		this.getClientPeripherals().forEach((peripheralPartsContainer: PeripheralPartsContainer) => {

			const backupDB: iSQLiteDatabase = this.dataManager.getDatabase(peripheralPartsContainer.key);
			const peripheral: Peripheral = peripheralPartsContainer.peripheral as Peripheral;

			backupDB.transaction((backupTransaction: iTransaction) => {

				if (state === "active") {
					this.dataManager.restoreAllDataFromBackupTable(peripheral, backupTransaction,
						(backupTransaction: iTransaction, result: Array<UserDataStructure>) => {

						if (result) {
							peripheral.setData(peripheral.getData().concat(result));
							this.dataManager.emptyBackupTable(peripheral, backupTransaction, (_transaction: iTransaction, _result: Function) => {
								// todo
							});
						}
					});
				}
				else {
					// todo peripheral and peripheral.getData()
					this.dataManager.insertDataIntoBackupTable(peripheral, peripheral.getData(), backupTransaction,
						(_transaction: iTransaction, _results: any) => {

						peripheral.initializeData();
					});
				}
			}, (error: Error) => {
				console.log(error);
			});
		});
	}
}