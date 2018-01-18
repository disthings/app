import {iClientPeripheral} from "../../../model/i_client_peripheral";
import {Peripheral} from "../../../model/peripheral";
import {PeripheralType, UserDataStructure} from "../../../types";
import {Sensors} from "../../../js_to_typescript_adapters/react-native-sensors";

export class AccelerationSensor extends Peripheral implements iClientPeripheral {


	private accelerationObservable: any;

	constructor() {
		super("Acceleration Sensor", PeripheralType.CLIENT);

		this.accelerationObservable = new Sensors.Accelerometer({
			updateInterval: 400, // defaults to 100ms
		});

		this.accelerationObservable
			.map(({x, y, z }: {x: number; y: number; z: number}) => x + y + z)
			.filter((speed: number) => speed > 10)
			.subscribe((speed: number) => {
				this.setData(this.getData().concat([{
					acceleration: speed
				}]));
			});

	}

	getTileData(): UserDataStructure {
		return this.getData();
	}

	getViewData(): UserDataStructure {
		return this.getData();
	}

	removeOldData(): Array<UserDataStructure> {
		let oldData: Array<UserDataStructure> = [].concat(this.getData()[0]);
		this.setData([]);
		return oldData;
	}
}