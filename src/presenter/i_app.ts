import {iPeripheral} from "../model/i_peripheral";
import {PeripheralPartsContainer, ViewType} from "../types";

export interface iApp {
	addClientPeripheral(peripheralPartsContainer: PeripheralPartsContainer): void;
	addServerPeripheral(peripheralPartsContainer: PeripheralPartsContainer): void;
	removePeripheral(peripheral: iPeripheral): void;
	getClientPeripherals(): Array<PeripheralPartsContainer>;
	getServerPeripherals(): Array<PeripheralPartsContainer>;
	setCurrentViewType(screenType: ViewType): void;
	getCurrentViewType(): ViewType;
	setCurrentPeripheral(peripheral: iPeripheral): void;
	isReadyForInterval(): boolean;
	onReadyToRender(callback: Function): void;
	setNewIP(ip: string): void;
	setAppState(state: string): void;
}