import * as React from "react";
import {PeripheralTileData} from "../../../view/peripheral_tile_data";
import {StyleSheet, Text, View} from "react-native";
import {PeripheralTileDataState} from "../../../types";

export class LightSensorTileData extends PeripheralTileData<any, PeripheralTileDataState> {

	constructor(props: any, state: any) {
		super(props, state);
	}

	onLayoutChange(_layout: string): void {
		return;
	}

	render(): React.ReactNode {

		let value: number = this.state.data.length > 0 ? this.state.data[this.state.data.length - 1].data : 0;
		const colors: any = StyleSheet.create({
			textColor: {
				color: this.state.currentThemeName === "light" ? "#2B2B2B" : "#D3D3D3"
			}
		});
		return (<View>
				<Text style={colors.textColor}>Level (%): {value}</Text>
			</View>);
	}
}