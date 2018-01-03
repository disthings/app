import {PeripheralPartsContainer, ViewType} from "../types";
import {Peripheral} from "../model/peripheral";

export interface iApp {
	addPeripheral(peripheralPartsContainer: PeripheralPartsContainer): void;
	removePeripheral(peripheral: Peripheral): void;
	getClientPeripherals(): Array<PeripheralPartsContainer>;
	getServerPeripherals(): Array<PeripheralPartsContainer>;
	setCurrentViewType(screenType: ViewType): void;
	getCurrentViewType(): ViewType;
	setCurrentPeripheral(peripheral: Peripheral): void;
	onReadyToRender(callback: Function): void;
	setConnectingIP(ip: string): void;
	managePeripheralDataBasedOnState(state: string): void;
}