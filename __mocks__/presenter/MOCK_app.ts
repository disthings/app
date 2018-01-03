import {iApp} from "../../src/presenter/i_app";
import {iSyncManager} from "../../src/model/i_synchronization_manager";
import {SyncManager} from "../model/MOCK_sync_manager";
import {iDataManager} from "../../src/model/i_data_manager";
import {DataManager} from "../model/MOCK_data_manager";
import {
	PeripheralPartsContainer, PeripheralType, RequestDataPackage,
	ResponseDataPackage, Settings, ViewType, Message, UserDataStructure
} from "../../src/types";
import {iSQLiteDatabase} from "../../src/model/i_sqlite_database";
import Timer = NodeJS.Timer;
import {DefaultValues} from "../../src/defaults/default_values";
import {Peripheral} from "../../src/model/peripheral";
import {SettingsManager} from "../model/MOCK_settings_manager";
import {StartingSettings} from "../../src/starting_settings";
import {iTransaction} from "../model/MOCK_i_transaction";
import {forEachAsync} from "../../src/generic_functions";

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
					console.log("App_constructor", _error);
				});
			}

			this.maxTryCounter = this.settings.maxTryCounter;
			this.dataRequestInterval = this.settings.dataRequestInterval;
			this.didSettingsLoad = true;
			if(this.onReadyToRenderCallback) {
				this.onReadyToRenderCallback(this.settings.webSocket.host);
			}

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

	addPeripheral(peripheralPartsContainer: PeripheralPartsContainer): void {
		const type: PeripheralType = (peripheralPartsContainer.peripheral as Peripheral).getType();
		if(type === PeripheralType.SERVER) {
			this.addServerPeripheral(peripheralPartsContainer);
		}
		else if(type === PeripheralType.CLIENT) {
			this.addClientPeripheral(peripheralPartsContainer);
		}
		else {
			console.error(new Error("Invalid peripheral type: " + type));
		}
	}

	private addClientPeripheral(peripheralPartsContainer: PeripheralPartsContainer): void {
		this.waitForServer();

		let peripheral: Peripheral = peripheralPartsContainer.peripheral as Peripheral;

		this.dataManager.addPeripheralToMemory(peripheralPartsContainer);

		const db: iSQLiteDatabase = this.dataManager.createDatabase(peripheral.getName());

		db.transaction((transaction: iTransaction) => {

			this.dataManager.createDbTables(peripheral, transaction, () => {
				this.stopWaitingForServer();
			});

			transaction.commit((error: Error) => {
				console.error("addClientPeripheral 1", error);
			});
		}, (error: Error) => {
			console.error("addClientPeripheral 2", error);
		});
	}

	private addServerPeripheral(peripheralPartsContainer: PeripheralPartsContainer): void {
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

		if(peripheral.getType() === PeripheralType.SERVER) {
			peripheral.unsubscribeFromEvent("command", this.subscriberID);
		}

		while (!found && i < arrayLength) {
			let peripheralParts: PeripheralPartsContainer = arrayToBeSearched[i];
			let peripheral: Peripheral = peripheralParts.peripheral as Peripheral;
			if (found = peripheral.getName() === peripheral.getName()) {
				arrayToBeSearched.splice(i, 1);
			}
			i++;
		}

		this.dataManager.closeDatabase(peripheral.getName(), (error: Error) => {
			console.error("removePeripheral", error);
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
		this.syncManager.subscribeToMessageType("serverAllPeripheralsData", (message: Message) => {
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
		this.syncManager.subscribeToMessageType("getClientAllPeripheralsData", (message: Message) => {
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
		this.syncManager.subscribeToMessageType("clientAllPeripheralsDataReceived", (_message: Message) => {
			this.stopWaitingForServer();
		}, this.subscriberID);
	}



	private subscribeToServerPeripheralData(): void {
		this.syncManager.subscribeToMessageType("serverPeripheralData", (message: Message) => {
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

		forEachAsync(clientPeripherals, (peripheralPartsContainer: PeripheralPartsContainer,
													   _indexOrKey: number | string, next: () => void) => {

			let peripheral: Peripheral = peripheralPartsContainer.peripheral as Peripheral;
			let peripheralName: string = peripheral.getName();
			let db: iSQLiteDatabase = this.dataManager.getDatabase(peripheralName);
			db.transaction((transaction: iTransaction) => {

				this.dataManager.restoreAllDataFromDataTable(peripheral, transaction, (transaction: iTransaction, result: Array<UserDataStructure>) => {
					responseDataPackages.push({
						"name": peripheralName,
						"data": result,
						"peripheralType": PeripheralType.CLIENT
					});

					this.dataManager.emptyDataTable(peripheral, transaction, () => {
						transaction.commit((error: Error) => {
							console.error("getClientAllPeripheralsData 1", error);
						});
						next();
					});
				});

			}, (error: Error) => {
				console.error("getClientAllPeripheralsData 2", error);
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
				"peripheralType": PeripheralType.SERVER
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

	setConnectingIP(ip: string): void {
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

	managePeripheralDataBasedOnState(state: string): void {
		this.getClientPeripherals().forEach((peripheralPartsContainer: PeripheralPartsContainer) => {

			const backupDB: iSQLiteDatabase = this.dataManager.getDatabase(peripheralPartsContainer.key);
			const peripheral: Peripheral = peripheralPartsContainer.peripheral as Peripheral;

			backupDB.transaction((backupTransaction: iTransaction) => {

				if (state === "active") {
					this.dataManager.restorePeripheralDataFromBackupTable(peripheral, backupTransaction,
						(backupTransaction: iTransaction, result: Array<UserDataStructure>) => {

							if (result) {
								peripheral.setData(peripheral.getData().concat(result));
								this.dataManager.emptyBackupTable(peripheral, backupTransaction, () => {
									backupTransaction.commit((error: Error) => {
										console.log("managePeripheralDataBasedOnState 1", error);
									});
								});
							}
						});
				}
				else {
					// todo peripheral and peripheral.getData()
					this.dataManager.insertPeripheralDataIntoBackupTable(peripheral, peripheral.getData(), backupTransaction,
						() => {
							backupTransaction.commit((error: Error) => {
								console.log("managePeripheralDataBasedOnState 2", error);
							});
							peripheral.initializeData();
						});
				}
			}, (error: Error) => {
				console.log("managePeripheralDataBasedOnState 3", error);
			});
		});
	}
}