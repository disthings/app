"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite_database_1 = require("../__mocks__/model/sqlite_database");
const db = new sqlite_database_1.SQLiteDatabase("TEST_2");
test("Get Name", () => {
    expect(db.getName()).toBe("TEST_2");
});
test("Close db", () => {
    db.close((error) => {
        console.log("Close db test", error);
    });
});
//# sourceMappingURL=i_sqlite_database.js.map