"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_manager_1 = require("../__mocks__/model/data_manager");
const dm = new data_manager_1.DataManager();
const db = dm.createDatabase("TEST");
test("Get Name", () => {
    expect(db.getName()).toBe("TEST");
});
test("Close db", () => {
    db.close((error) => {
        throw error;
    });
});
//# sourceMappingURL=database.js.map