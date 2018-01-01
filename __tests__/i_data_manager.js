"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_manager_1 = require("../__mocks__/model/data_manager");
const empty_view_1 = require("../src/defaults/empty_view");
const empty_peripheral_1 = require("../src/defaults/empty_peripheral");
const types_1 = require("../src/types");
const dm = new data_manager_1.DataManager();
const mp_2 = new empty_peripheral_1.EmptyPeripheral("Mocked_Peripheral_2", types_1.PeripheralType.CLIENT);
dm.addClientPeripheral({
    key: "Mocked_Peripheral_2",
    peripheral: mp_2,
    view: empty_view_1.EmptyView,
    tile: empty_view_1.EmptyView
});
const db_2 = dm.createDatabase("Mocked_Peripheral_2");
test("Get database", () => {
    expect(dm.getDatabase("Mocked_Peripheral_2")).toBeDefined();
});
test("Get client peripherals", () => {
    expect(dm.getClientPeripherals()).toHaveLength(1);
});
test("Create db tables", (done) => {
    db_2.transaction((tx) => {
        dm.createDbTables(mp_2, tx, (_result) => {
            tx.commit((error) => {
                if (error) {
                    console.log("Create db tables test 1", error);
                }
            });
            done();
        });
    }, (error) => {
        console.log("Create db tables test 1", error);
    });
});
//# sourceMappingURL=i_data_manager.js.map