import {DataSet, PeripheralPartsContainer, PeripheralType, RequestDataPackage} from "../types";
import {EmptyPeripheral} from "./empty_peripheral";
import {Peripheral} from "../model/peripheral";
import {EmptyView} from "./empty_view";

export class DefaultValues {
	static REQUEST_DATA_PACKAGE: RequestDataPackage = {
		name: "",
		timestamp: -1,
		data: {},
		peripheralType: PeripheralType.EMPTY,
		dataSet: DataSet.NONE
	};
	static EMPTY_PERIPHERAL: Peripheral = new EmptyPeripheral("", PeripheralType.EMPTY);
	static PERIPHERAL_PARTS_CONTAINER: PeripheralPartsContainer = {
		peripheral: DefaultValues.EMPTY_PERIPHERAL,
		view: EmptyView,
		tile: EmptyView,
		key: ""
	};
}