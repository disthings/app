import {iDataManager} from "../src/model/i_data_manager";
import {iSQLiteDatabase} from "../src/model/i_sqlite_database";
import {iTransaction} from "../__mocks__/model/MOCK_i_transaction";
import {DataManager} from "../__mocks__/model/MOCK_data_manager";
import {EmptyView} from "../src/defaults/empty_view";
import {EmptyPeripheral} from "../src/defaults/empty_peripheral";
import {Peripheral} from "../src/model/peripheral";
import {PeripheralType} from "../src/types";
import {errorCallback} from "../src/generic_functions";

const dm: iDataManager = new DataManager();
const mp_2: Peripheral = new EmptyPeripheral("Mocked_Peripheral_2", PeripheralType.CLIENT);
const data: any = ["DATA"];

dm.addPeripheralToMemory({
	key: "Mocked_Peripheral_2",
	peripheral: mp_2,
	view: EmptyView,
	tile: EmptyView
});

const db_2: iSQLiteDatabase = dm.createDatabase("Mocked_Peripheral_2");


test("Get database", () => {
	expect(dm.getDatabase("Mocked_Peripheral_2")).toBeDefined();
});

test("Get client peripherals", () => {
	expect(dm.getClientPeripherals()).toHaveLength(1);
});

test("Create db tables", (done: Function) => {
	db_2.transaction((tx: iTransaction) => {
		dm.createDbTables(mp_2, tx, (_result: any) => {

			tx.commit(errorCallback);
			done();
		});
	}, (error: Error) => {
		console.error("Create db tables test 1", error);
	});
});

test("Insert data into data_table", (done: Function) => {
	db_2.transaction((tx: iTransaction) => {
		dm.insertDataIntoDataTable(mp_2, data, tx, (_result: any) => {
			tx.commit(errorCallback);
			done();
		});
	}, (error: Error) => {
		console.error("Insert data into data_table test", error);
	});
});

test("insert data into backup_table", (done: Function) => {
	db_2.transaction((tx: iTransaction) => {
		dm.insertPeripheralDataIntoBackupTable(mp_2, data, tx, (_result: any) => {
			tx.commit(errorCallback);
			done();
		});
	}, (error: Error) => {
		console.error("insert data into backup_table test", error);
	});
});

test("restore all data from data_table", (done: Function) => {
	db_2.transaction((tx: iTransaction) => {
		dm.restoreAllDataFromDataTable(mp_2, tx, (result: any) => {
			expect(result.length).toBeGreaterThan(0);
			tx.commit(errorCallback);
			done();
		});
	}, (error: Error) => {
		console.error("restore all data from data_table test", error);
	});
});


test("restore all data from backup_table", (done: Function) => {
	db_2.transaction((tx: iTransaction) => {
		dm.restorePeripheralDataFromBackupTable(mp_2, tx, (result: any) => {
			expect(result.length).toBeGreaterThan(0);
			tx.commit(errorCallback);
			done();
		});
	}, (error: Error) => {
		console.error("restore all data from backup_table test", error);
	});
});

test("empty data_table", (done: Function) => {
	db_2.transaction((tx: iTransaction) => {
		dm.emptyDataTable(mp_2, tx, (_result: any) => {
			tx.commit(errorCallback);
			done();
		});
	}, (error: Error) => {
		console.error("empty data_table test", error);
	});
});

test("empty backup_table", (done: Function) => {
	db_2.transaction((tx: iTransaction) => {
		dm.emptyBackupTable(mp_2, tx, (_result: any) => {
			tx.commit(errorCallback);
			done();
		});
	}, (error: Error) => {
		console.error("empty backup_table test", error);
	});
});

test("restore all data from empty data_table", (done: Function) => {
	db_2.transaction((tx: iTransaction) => {
		dm.restoreAllDataFromDataTable(mp_2, tx, (result: any) => {
			expect(result.length).toBe(0);
			tx.commit(errorCallback);
			done();
		});
	}, (error: Error) => {
		console.error("restore all data from empty data_table test", error);
	});
});


test("restore all data from empty backup_table", (done: Function) => {
	db_2.transaction((tx: iTransaction) => {
		dm.restorePeripheralDataFromBackupTable(mp_2, tx, (result: any) => {
			expect(result.length).toBe(0);
			tx.commit(errorCallback);
			done();
		});
	}, (error: Error) => {
		console.error("restore all data from empty backup_table test", error);
	});
});

test("close database", () => {
	dm.closeDatabase("Mocked_Peripheral_2", errorCallback);
});