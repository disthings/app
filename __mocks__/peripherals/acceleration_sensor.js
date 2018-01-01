"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const peripheral_1 = require("../../src/model/peripheral");
class AccelerationSensor extends peripheral_1.Peripheral {
    constructor(name, type) {
        super(name, type);
        this.readPeripheralData();
    }
    readPeripheralData() {
        setInterval(() => {
            this.setData(this.getData().concat([{
                    acceleration: 23.43245543212
                }]));
        }, 2000);
    }
    getTileData() {
        return this.getData();
    }
    getViewData() {
        return this.getData();
    }
    getSettingsData() {
        return {};
    }
    getOldData() {
        return this.getData();
    }
    deleteOldDataFromMemory() {
        this.setData([]);
    }
}
exports.AccelerationSensor = AccelerationSensor;
//# sourceMappingURL=acceleration_sensor.js.map