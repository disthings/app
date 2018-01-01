import {iClientPeripheral} from "../../src/model/i_client_peripheral";
import {Peripheral} from "../../src/model/peripheral";
import {PeripheralType, UserDataStructure} from "../../src/types";

export class AccelerationSensor extends Peripheral implements iClientPeripheral {

	constructor(name: string, type: PeripheralType) {
		super(name, type);
		this.readPeripheralData();
	}

	readPeripheralData(): void {
		setInterval(() => {
			this.setData(this.getData().concat([{
				acceleration: 23.43245543212
			}]));
		}, 2000);
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

	getOldData(): Array<UserDataStructure> {
		return this.getData();
	}

	deleteOldDataFromMemory(): void {
		this.setData([]);
	}
}