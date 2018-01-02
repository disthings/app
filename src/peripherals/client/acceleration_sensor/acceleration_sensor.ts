import {iClientPeripheral} from "../../../model/i_client_peripheral";
import {Peripheral} from "../../../model/peripheral";
import {PeripheralType, UserDataStructure} from "../../../types";
import {Sensors} from "../../../js_to_typescript_adapters/react-native-sensors";

export class AccelerationSensor extends Peripheral implements iClientPeripheral {


	private accelerationObservable: any;

	constructor(name: string, type: PeripheralType) {
		super(name, type);

		this.accelerationObservable = new Sensors.Accelerometer({
			updateInterval: 2000, // defaults to 100ms
		});
	}

	readPeripheralData(): void {

		this.accelerationObservable
			.map(({x, y, z }: {x: number; y: number; z: number}) => x + y + z)
			.filter((speed: number) => speed > 20)
			.subscribe((speed: number) => {
				this.setData(this.getData().concat([{
					acceleration: speed
				}]));
			});
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