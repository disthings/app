"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../__mocks__/presenter/app");
const acceleration_sensor_1 = require("../__mocks__/peripherals/acceleration_sensor");
const types_1 = require("../src/types");
const empty_view_1 = require("../src/defaults/empty_view");
const app = new app_1.App();
app.addClientPeripheral({
    key: "Acceleration Sensor",
    peripheral: new acceleration_sensor_1.AccelerationSensor("Acceleration Sensor", types_1.PeripheralType.CLIENT),
    view: empty_view_1.EmptyView,
    tile: empty_view_1.EmptyView
});
test("Get client peripherals", () => {
    expect(app.getClientPeripherals().length).toBe(1);
});
//# sourceMappingURL=app.js.map