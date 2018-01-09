import {iApp} from "./i_app";
import {iSyncManager} from "../model/i_synchronization_manager";
import {SyncManager} from "../model/synchronization_manager";
import {iDataManager} from "../model/i_data_manager";
import {DataManager} from "../model/data_manager";
import {iPeripheralInternal, Message, PeripheralPartsDeclaration, UserDataStructure} from "../types";
import {
	PeripheralPartsContainer, PeripheralType, RequestDataPackage, ResponseDataPackage, Settings, ViewType
} from "../types";
import {iSQLiteDatabase} from "../model/i_sqlite_database";
import {iTransaction} from "../model/i_transaction";
import Timer = NodeJS.Timer;
import {DefaultValues} from "../defaults/default_values";
import {Peripheral} from "../model/peripheral";
import {SettingsManager} from "../model/settings_manager";
import {StartingSettings} from "../starting_settings";
import {errorCallback, forEachAsync} from "../generic_functions";

/*
This class manages the communication between the backend and the frontend. It is responsible for the activation of
the synchronization, as well as sending the data to memory or the database.
 */
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
	private maxSkippedIntervals: number;
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

			if(result) { // if there are already saved settings
				this.settings = result;
			}
			else { // get the initial settings
				this.settings = SettingsManager.getStartingSettings();
				SettingsManager.resetSettings(errorCallback);
			}

			this.maxSkippedIntervals = this.settings.maxSkippedIntervals;
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
		this.decideViewAction();
		this.loopID = setInterval(() => {
			this.decideViewAction();
		}, this.dataRequestInterval);
	}

	private deactivateInterval(): void {
		clearInterval(this.loopID);
		delete this.loopID;
	}

	private decideViewAction(): void {
		switch (this.currentViewType) {
			case ViewType.MAIN:
				this.takeViewAction(this.getServerAllPeripheralsData.bind(this));
				break;
			case ViewType.PERIPHERAL:
				if(this.currentPeripheral.getType() === PeripheralType.SERVER) {
					this.takeViewAction(this.getServerPeripheralData.bind(this));
				}
				break;
			case ViewType.SETTINGS:

				break;
			default:
				console.error(new Error("No such screen"));
		}
	}

	private takeViewAction(viewAction: Function): void {
		if(this.isReadyForInterval()) {
			this.waitForServer();
			viewAction();
		}
		else if(this.isSocketReady) {
			this.tryCounter++; // increment the try counter to increase the waiting time between retries
		}

		// after some time stop waiting to enable a retry
		if(this.tryCounter === this.maxSkippedIntervals && this.isSocketReady) {
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

	private isReadyForInterval(): boolean {
		return this.isSocketReady && !this.isWaiting && this.didSettingsLoad;
	}

	onReadyToRender(callback: Function): void {
		this.onReadyToRenderCallback = callback;
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
		}, errorCallback);
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

	addPeripheral(peripheralPartsDeclaration: PeripheralPartsDeclaration): void {

		const peripheral: iPeripheralInternal = new (peripheralPartsDeclaration.peripheral as any);
		const type: PeripheralType = peripheral.getType();
		const peripheralPartsContainer: PeripheralPartsContainer = {
			peripheral: peripheral,
			view: peripheralPartsDeclaration.view,
			tile: peripheralPartsDeclaration.tile,
			key: peripheral.getName()
		};

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

		this.dataManager.closeDatabase(peripheral.getName(), errorCallback);
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
				console.error(new Error("No such peripheral type."));
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

		this.getClientAllPeripheralsData((data: any) => {
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

	private getClientAllPeripheralsData(callback: Function): void {

		const responseDataPackages: Array<ResponseDataPackage> = [];
		const clientPeripherals: Array<PeripheralPartsContainer> = this.getClientPeripherals();


		forEachAsync(clientPeripherals, (peripheralPartsContainer: PeripheralPartsContainer,
													   _indexOrKey: number | string, next: () => void) => {

			let peripheral: iPeripheralInternal = peripheralPartsContainer.peripheral as iPeripheralInternal;
			let peripheralName: string = peripheral.getName();
			let db: iSQLiteDatabase = this.dataManager.getDatabase(peripheralName);
			db.transaction((transaction: iTransaction) => {

				this.dataManager.restoreAllDataFromDataTable(peripheral.getName(), transaction, (transaction: iTransaction, result: Array<UserDataStructure>) => {
					responseDataPackages.push({
						"name": peripheralName,
						"data": result,
						"peripheralType": PeripheralType.CLIENT
					});

					this.dataManager.emptyDataTable(peripheral, transaction, (_transaction: iTransaction, _result: any) => {
						next();
					});
				});

				}, errorCallback);
		},() => {
			callback(responseDataPackages);
		});
	}

	private getServerPeripheralData(): void {
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

	private getPeripheralPartsContainerFromName(name: string, peripheralType: PeripheralType): PeripheralPartsContainer {
		let found: boolean = false;
		let i: number = 0;
		let foundPeripheralParts: PeripheralPartsContainer = DefaultValues.PERIPHERAL_PARTS_CONTAINER;
		const arrayToSearch: Array<PeripheralPartsContainer> = this.getArrayBasedOnPeripheralType(peripheralType);

		while (!found && i < arrayToSearch.length) {
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

	/*
	This function backs up or restores from the backup table the clients' peripheral data, based on the state of the
	app. Possible states are active and inactive.
	 */
	managePeripheralDataBasedOnState(state: string): void {
		this.getClientPeripherals().forEach((peripheralPartsContainer: PeripheralPartsContainer) => {

			const backupDB: iSQLiteDatabase = this.dataManager.getDatabase(peripheralPartsContainer.key);
			const peripheral: iPeripheralInternal = peripheralPartsContainer.peripheral as iPeripheralInternal;

			backupDB.transaction((backupTransaction: iTransaction) => {

				if (state === "active") {
					this.dataManager.restorePeripheralDataFromBackupTable(peripheral.getName(), backupTransaction,
						(backupTransaction: iTransaction, result: Array<UserDataStructure>) => {

						if (result) {
							peripheral.setData(peripheral.getData().concat(result));
							this.dataManager.emptyBackupTable(peripheral, backupTransaction, () => {
								// console.log():
							});
						}
					});
				}
				else {
					this.dataManager.insertPeripheralDataIntoBackupTable(peripheral.getName(), peripheral.getData(),
						backupTransaction, () => {
						peripheral.initializeData();
					});
				}
			}, errorCallback);
		});
	}
}