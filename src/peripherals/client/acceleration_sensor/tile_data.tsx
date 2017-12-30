import * as React from "react";
import {PeripheralTileData} from "../../../view/peripheral_tile_data";
import {Text, View} from "react-native";
import {PeripheralTileDataProps, PeripheralTileDataState} from "../../../types";

export class AccelerationSensorTileData<K extends PeripheralTileDataProps, L extends PeripheralTileDataState>
	extends PeripheralTileData<PeripheralTileDataProps, PeripheralTileDataState> {

	constructor(props: K, state: L) {
		super(props, state);
	}

	render(): React.ReactNode {

		let data: any = this.state.data;
		let text: string = data.length > 0 ? "Acceleration: " + data[0].acceleration : "No rapid movement";

		return (<View>
				<Text>{text}</Text>
			</View>);
	}


}