import {iPeripheralInternal, PeripheralPartsContainer, PeripheralType} from "../types";
import {EmptyView} from "./empty_view";
import {EmptyPeripheral} from "./empty_peripheral";

export class DefaultValues {
	static EMPTY_PERIPHERAL: iPeripheralInternal = new EmptyPeripheral("EmptyPeripheral", PeripheralType.EMPTY);

	static PERIPHERAL_PARTS_CONTAINER: PeripheralPartsContainer = {
		peripheral: DefaultValues.EMPTY_PERIPHERAL,
		view: EmptyView,
		tile: EmptyView,
		key: "EmptyPeripheral"
	};


}