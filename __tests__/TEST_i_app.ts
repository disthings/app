import {iApp} from "../src/presenter/i_app";
import {App} from "../__mocks__/presenter/MOCK_app";
import {EmptyView} from "../src/defaults/empty_view";
import {EmptyPeripheral} from "../src/defaults/empty_peripheral";
import {PeripheralType} from "../src/types";
import {Peripheral} from "../src/model/peripheral";

const app: iApp = new App();
const mp_1: Peripheral = new EmptyPeripheral("Mocked_Peripheral_1", PeripheralType.CLIENT);


app.addPeripheral({
	key: "Mocked_Peripheral_1",
	peripheral: mp_1,
	view: EmptyView,
	tile: EmptyView
});

test("Get 1 client peripheral", () => {
	expect(app.getClientPeripherals()).toHaveLength(1);
	app.removePeripheral(mp_1);
});



test("Get no client peripheral", () => {
	expect(app.getClientPeripherals()).toHaveLength(0);
});