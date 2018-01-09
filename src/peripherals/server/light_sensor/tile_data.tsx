import * as React from "react";
import {PeripheralTileData} from "../../../view/peripheral_tile_data";
import {Text, View} from "react-native";
import {PeripheralTileDataState} from "../../../types";

export class LightSensorTileData extends PeripheralTileData<any, PeripheralTileDataState> {

	constructor(props: any, state: any) {
		super(props, state);
	}

	render(): React.ReactNode {

		let value: number = this.state.data.length > 0 ? this.state.data[this.state.data.length - 1].data : 0;

		return (<View>
				<Text>Level (%): {value}</Text>
			</View>);
	}
}