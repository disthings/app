"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_manager_1 = require("../__mocks__/model/data_manager");
const empty_view_1 = require("../src/defaults/empty_view");
const empty_peripheral_1 = require("../src/defaults/empty_peripheral");
const types_1 = require("../src/types");
const default_values_1 = require("../src/defaults/default_values");
const dm = new data_manager_1.DataManager();
const mp_2 = new empty_peripheral_1.EmptyPeripheral("Mocked_Peripheral_2", types_1.PeripheralType.CLIENT);
const data = ["DATA"];
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
            tx.commit(default_values_1.DefaultValues.ERROR_CALLBACK);
            done();
        });
    }, (error) => {
        console.error("Create db tables test 1", error);
    });
});
test("Insert data into data_table", (done) => {
    db_2.transaction((tx) => {
        dm.insertDataIntoDataTable(mp_2, data, tx, (_result) => {
            tx.commit(default_values_1.DefaultValues.ERROR_CALLBACK);
            done();
        });
    }, (error) => {
        console.error("Insert data into data_table test", error);
    });
});
test("insert data into backup_table", (done) => {
    db_2.transaction((tx) => {
        dm.insertDataIntoBackupTable(mp_2, data, tx, (_result) => {
            tx.commit(default_values_1.DefaultValues.ERROR_CALLBACK);
            done();
        });
    }, (error) => {
        console.error("insert data into backup_table test", error);
    });
});
test("restore all data from data_table", (done) => {
    db_2.transaction((tx) => {
        dm.restoreAllDataFromDataTable(mp_2, tx, (result) => {
            expect(result.length).toBeGreaterThan(0);
            tx.commit(default_values_1.DefaultValues.ERROR_CALLBACK);
            done();
        });
    }, (error) => {
        console.error("restore all data from data_table test", error);
    });
});
test("restore all data from backup_table", (done) => {
    db_2.transaction((tx) => {
        dm.restoreAllDataFromBackupTable(mp_2, tx, (result) => {
            expect(result.length).toBeGreaterThan(0);
            tx.commit(default_values_1.DefaultValues.ERROR_CALLBACK);
            done();
        });
    }, (error) => {
        console.error("restore all data from backup_table test", error);
    });
});
test("empty data_table", (done) => {
    db_2.transaction((tx) => {
        dm.emptyDataTable(mp_2, tx, (_result) => {
            tx.commit(default_values_1.DefaultValues.ERROR_CALLBACK);
            done();
        });
    }, (error) => {
        console.error("empty data_table test", error);
    });
});
test("empty backup_table", (done) => {
    db_2.transaction((tx) => {
        dm.emptyBackupTable(mp_2, tx, (_result) => {
            tx.commit(default_values_1.DefaultValues.ERROR_CALLBACK);
            done();
        });
    }, (error) => {
        console.error("empty backup_table test", error);
    });
});
test("restore all data from empty data_table", (done) => {
    db_2.transaction((tx) => {
        dm.restoreAllDataFromDataTable(mp_2, tx, (result) => {
            expect(result.length).toBe(0);
            tx.commit(default_values_1.DefaultValues.ERROR_CALLBACK);
            done();
        });
    }, (error) => {
        console.error("restore all data from empty data_table test", error);
    });
});
test("restore all data from empty backup_table", (done) => {
    db_2.transaction((tx) => {
        dm.restoreAllDataFromBackupTable(mp_2, tx, (result) => {
            expect(result.length).toBe(0);
            tx.commit(default_values_1.DefaultValues.ERROR_CALLBACK);
            done();
        });
    }, (error) => {
        console.error("restore all data from empty backup_table test", error);
    });
});
test("close database", () => {
    dm.closeDatabase("Mocked_Peripheral_2", default_values_1.DefaultValues.ERROR_CALLBACK);
});
//# sourceMappingURL=i_data_manager.js.map