import {iApp} from "../src/presenter/i_app";
import {App} from "../__mocks__/presenter/MOCK_app";
import {EmptyView} from "../src/defaults/empty_view";
import {EmptyPeripheral} from "../src/defaults/empty_peripheral";
import {iClientPeripheral} from "../src/model/i_client_peripheral";
import {PeripheralType} from "../src/types";

const app: iApp = new App();
const mp_1: iClientPeripheral = new EmptyPeripheral("Mocked_Peripheral_1", PeripheralType.CLIENT);


app.addClientPeripheral({
	key: "Mocked_Peripheral_1",
	peripheral: mp_1,
	view: EmptyView,
	tile: EmptyView
});

test("Get client peripherals", () => {
	expect(app.getClientPeripherals()).toHaveLength(1);
});