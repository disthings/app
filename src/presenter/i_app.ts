import {ColorTheme, PeripheralPartsContainer, PeripheralPartsDeclaration, ViewType} from "../types";
import {Peripheral} from "../model/peripheral";

export interface iApp {
	addPeripheral(peripheralPartsDeclaration: PeripheralPartsDeclaration): void;
	removePeripheral(peripheral: Peripheral): void;
	getClientPeripherals(): Array<PeripheralPartsContainer>;
	getServerPeripherals(): Array<PeripheralPartsContainer>;
	setCurrentViewType(screenType: ViewType): void;
	getCurrentViewType(): ViewType;
	setCurrentPeripheral(peripheral: Peripheral): void;
	setConnectingIP(ip: string): void;
	managePeripheralDataBasedOnState(state: string): void;
	getCurrentColorTheme(): ColorTheme;
	getAllColorThemes(): Array<string>;
	loadColorTheme(name: string): ColorTheme;
}