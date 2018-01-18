import * as React from "react";
import {PeripheralTileData} from "../../../view/peripheral_tile_data";
import {Text, View, StyleSheet} from "react-native";
import {PeripheralTileDataState} from "../../../types";

export class AccelerationSensorTileData	extends PeripheralTileData<any, PeripheralTileDataState> {

	constructor(props: any, state: any) {
		super(props, state);
	}

	onLayoutChange(_layout: string): void {
		return;
	}

	render(): React.ReactNode {
		const colors: any = StyleSheet.create({
			textColor: {
				color: this.state.currentThemeName === "light" ? "#2B2B2B" : "#D3D3D3"
			}
		});
		let data: any = this.state.data;
		let text: string = data.length > 0 ? "Acceleration: " + data[0].acceleration : "No rapid movement";
		return (<View>
				<Text style={colors.textColor}>{text}</Text>
			</View>);
	}
}