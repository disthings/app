import {iDataManager} from "../src/model/i_data_manager";
import {iSQLiteDatabase} from "../src/model/i_sqlite_database";
import {iTransaction} from "../__mocks__/model/i_transaction";
import {DataManager} from "../__mocks__/model/data_manager";
import {EmptyView} from "../src/defaults/empty_view";
import {EmptyPeripheral} from "../src/defaults/empty_peripheral";
import {Peripheral} from "../src/model/peripheral";
import {PeripheralType} from "../src/types";


const dm: iDataManager = new DataManager();

const mp_2: Peripheral = new EmptyPeripheral("Mocked_Peripheral_2", PeripheralType.CLIENT);

dm.addClientPeripheral({
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

			tx.commit((error: Error) => {
				if(error) {
					console.log("Create db tables test 1", error);
				}
			});
			done();
		});
	}, (error: Error) => {
		console.log("Create db tables test 1", error);
	});
});