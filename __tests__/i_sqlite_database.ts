import {iSQLiteDatabase} from "../src/model/i_sqlite_database";
import {SQLiteDatabase} from "../__mocks__/model/sqlite_database";

const db: iSQLiteDatabase = new SQLiteDatabase("TEST_2");

test("Get Name", () => {
	expect(db.getName()).toBe("TEST_2");
});

test("Close db", () => {
	db.close((error: Error) => {
		console.log("Close db test", error);
	});
});