import {DataSet, ErrorCallback, PeripheralPartsContainer, PeripheralType, RequestDataPackage} from "../types";
import {EmptyView} from "./empty_view";
import {EmptyPeripheral} from "./empty_peripheral";
import {Peripheral} from "../model/peripheral";

/*
This class contains some default values and instances. Since we are trying to avoid using null, some defaults are needed.
Please try to create a default instance of some class instead of passing null.
*/
export class DefaultValues {
	static EMPTY_PERIPHERAL: Peripheral = new EmptyPeripheral("EmptyPeripheral", PeripheralType.EMPTY);

	static PERIPHERAL_PARTS_CONTAINER: PeripheralPartsContainer = {
		peripheral: DefaultValues.EMPTY_PERIPHERAL,
		view: EmptyView,
		tile: EmptyView,
		key: "EmptyPeripheral"
	};

	static REQUEST_DATA_PACKAGE: RequestDataPackage = {
		name: "EmptyPeripheral",
		timestamp: -1,
		data: {},
		peripheralType: PeripheralType.EMPTY,
		dataSet: DataSet.NONE
	};

	/*
	This is a standard callback for getting errors.
	 */
	static ERROR_CALLBACK: ErrorCallback = (error: Error) => {
		if(error) {
			console.error(error);
		}
	}
}