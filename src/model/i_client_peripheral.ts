import {iPeripheral} from "./i_peripheral";
import {UserDataStructure} from "../types";

export interface iClientPeripheral extends iPeripheral {
	readPeripheralData(): void;
	getOldData(): UserDataStructure;
	deleteOldDataFromMemory(): void;
}