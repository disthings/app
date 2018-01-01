"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../__mocks__/presenter/app");
const empty_view_1 = require("../src/defaults/empty_view");
const empty_peripheral_1 = require("../src/defaults/empty_peripheral");
const types_1 = require("../src/types");
const app = new app_1.App();
const mp_1 = new empty_peripheral_1.EmptyPeripheral("Mocked_Peripheral_1", types_1.PeripheralType.CLIENT);
app.addClientPeripheral({
    key: "Mocked_Peripheral_1",
    peripheral: mp_1,
    view: empty_view_1.EmptyView,
    tile: empty_view_1.EmptyView
});
test("Get client peripherals", () => {
    expect(app.getClientPeripherals()).toHaveLength(1);
});
//# sourceMappingURL=i_app.js.map