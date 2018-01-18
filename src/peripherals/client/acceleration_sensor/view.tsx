import * as React from "react";
import {View, Text, StyleSheet} from "react-native";
import {PeripheralView} from "../../../view/peripheral_view";
import {PeripheralViewProps, PeripheralViewState} from "../../../types";

export class AccelerationSensorView extends PeripheralView<PeripheralViewProps, PeripheralViewState> {

	constructor(props: any, state: any) {
		super(props, state);
	}


	onLayoutChange(_layout: string): void {
		return;
	}

	render(): React.ReactNode {
		let value: string = this.state.data ? JSON.stringify(this.state.data, null, "\t") : "No available data";
		const colors: any = StyleSheet.create({
			textColor: {
				color: this.state.currentThemeName === "light" ? "#2B2B2B" : "#D3D3D3"
			}
		});
		return (<View>
			<Text style={colors.textColor}>Data: {value}</Text>
		</View>);
	}
}