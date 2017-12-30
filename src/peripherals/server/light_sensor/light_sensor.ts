import {Peripheral} from "../../../model/peripheral";
import {iServerPeripheral} from "../../../model/i_server_peripheral";
import {PeripheralType, UserDataStructure} from "../../../types";

export class LightSensor extends Peripheral implements iServerPeripheral {

	constructor(name: string, type: PeripheralType) {
		super(name, type);
		this.setData([]);
	}

	removeOldData(): void {
		return;
	}



	getTileData(): any {
		return this.getData();
	}

	getViewData(): any {
		return this.getData();
	}

	getSettingsData(): any {
		return {};
	}


	getOldData(): UserDataStructure {
		return null;
	}

	deleteOldDataFromMemory(): void {
	}
}