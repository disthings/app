import {Peripheral} from "../../../model/peripheral";
import {iServerPeripheral} from "../../../model/i_server_peripheral";
import {PeripheralType} from "../../../types";

export class LightSensor extends Peripheral implements iServerPeripheral {

	constructor() {
		super("light_sensor", PeripheralType.SERVER);
	}

	getTileData(): any {
		return this.getData();
	}

	getViewData(): any {
		return this.getData();
	}
}