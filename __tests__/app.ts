import {iApp} from "../src/presenter/i_app";
import {App} from "../__mocks__/presenter/app";
import {AccelerationSensor} from "../__mocks__/peripherals/acceleration_sensor";
import {PeripheralType} from "../src/types";
import {EmptyView} from "../src/defaults/empty_view";

const app: iApp = new App();

app.addClientPeripheral({
	key: "Acceleration Sensor",
	peripheral: new AccelerationSensor("Acceleration Sensor", PeripheralType.CLIENT),
	view: EmptyView,
	tile: EmptyView
});

test("Get client peripherals", () => {
	expect(app.getClientPeripherals().length).toBe(1);
});

