import {Peripheral} from "../../../model/peripheral";
import {iServerPeripheral} from "../../../model/i_server_peripheral";
import {PeripheralType, UserDataStructure} from "../../../types";

export class LightSensor extends Peripheral implements iServerPeripheral {

	constructor() {
		super("light_sensor", PeripheralType.SERVER);
	}

	getTileData(): UserDataStructure {
		return this.getData();
	}

	getViewData(): UserDataStructure {
		return this.getData();
	}
}