import * as React from "react";
import {PeripheralTileData} from "../../../view/peripheral_tile_data";
import {Text, View} from "react-native";
import {PeripheralTileDataState} from "../../../types";

export class AccelerationSensorTileData	extends PeripheralTileData<any, PeripheralTileDataState> {

	constructor(props: any, state: any) {
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