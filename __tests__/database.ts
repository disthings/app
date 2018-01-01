import {iSQLiteDatabase} from "../src/model/i_sqlite_database";
import {DataManager} from "../__mocks__/model/data_manager";
import {iDataManager} from "../src/model/i_data_manager";

const dm: iDataManager = new DataManager();
const db: iSQLiteDatabase = dm.createDatabase("TEST");

test("Get Name", () => {
	expect(db.getName()).toBe("TEST");
});

test("Close db", () => {
	db.close((error: Error) => {
		throw error;
	});
});