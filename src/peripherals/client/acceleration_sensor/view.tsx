import * as React from "react";
import {View, Text} from "react-native";
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
		return (<View>
			<Text>Data: {value}</Text>
		</View>);
	}
}