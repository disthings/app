import {UserDataStructure} from "../types";

export interface iPeripheral {
	getTileData(): UserDataStructure;
	getViewData(): UserDataStructure;
}