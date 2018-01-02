import {PeripheralPartsContainer, ViewType} from "../types";
import {Peripheral} from "../model/peripheral";

export interface iApp {
	addClientPeripheral(peripheralPartsContainer: PeripheralPartsContainer): void;
	addServerPeripheral(peripheralPartsContainer: PeripheralPartsContainer): void;
	removePeripheral(peripheral: Peripheral): void;
	getClientPeripherals(): Array<PeripheralPartsContainer>;
	getServerPeripherals(): Array<PeripheralPartsContainer>;
	setCurrentViewType(screenType: ViewType): void;
	getCurrentViewType(): ViewType;
	setCurrentPeripheral(peripheral: Peripheral): void;
	isReadyForInterval(): boolean;
	onReadyToRender(callback: Function): void;
	setNewIP(ip: string): void;
	setAppState(state: string): void;
}