import {LightSensor} from "./server/light_sensor/light_sensor";
import {AccelerationSensor} from "./client/acceleration_sensor/acceleration_sensor";
import {PeripheralPartsContainer, PeripheralType} from "../types";
import {AccelerationSensorTileData} from "./client/acceleration_sensor/tile_data";
import {LightSensorTileData} from "./server/light_sensor/tile_data";
import {LightView} from "./server/light_sensor/view";
import {AccelerationSensorView} from "./client/acceleration_sensor/view";

/*
This is were the peripherals are declared. This exported array is being read by the ViewContainer and added to the App.
 */

let peripherals: Array<PeripheralPartsContainer> = [];

/*
To add your peripheral, create a PeripheralPartsContainer. Take note that under 'view' and 'tile' you have to
give just the class names for the peripheral's view and tile as imported , and not instances.
The framework manages the instantiation.
 */

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

export {peripherals};