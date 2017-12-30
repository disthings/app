import {LightSensor} from "./server/light_sensor/light_sensor";
import {AccelerationSensor} from "./client/acceleration_sensor/acceleration_sensor";
import {PeripheralPartsContainer, PeripheralType} from "../types";
import {AccelerationSensorTileData} from "./client/acceleration_sensor/tile_data";
import {LightSensorTileData} from "./server/light_sensor/tile_data";
import {LightView} from "./server/light_sensor/view";
import {AccelerationSensorView} from "./client/acceleration_sensor/view";

let peripherals: Array<PeripheralPartsContainer> = [];

peripherals.push({
	key: "Acceleration Sensor",
	peripheral: new AccelerationSensor("Acceleration Sensor", PeripheralType.CLIENT),
	view: AccelerationSensorView,
	tile: AccelerationSensorTileData
});

peripherals.push({
	key: "light_sensor",
	peripheral: new LightSensor("light_sensor", PeripheralType.SERVER),
	view: LightView,
	tile: LightSensorTileData
});

// peripherals.push({
// 	key: "Location Sensor123",
// 	peripheral: new AccelerationSensor(PeripheralType.CLIENT),
// 	view: AccelerationSensorView,
// 	tile: AccelerationSensorTileData
// });

export {peripherals};