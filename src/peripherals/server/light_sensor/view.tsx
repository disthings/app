import * as React from "react";
import {View, Text, Button} from "react-native";
import {PeripheralView} from "../../../view/peripheral_view";
import {PeripheralViewProps, PeripheralViewState} from "../../../types";

export class LightView<K extends PeripheralViewProps, L extends PeripheralViewState>
	extends PeripheralView<PeripheralViewProps, PeripheralViewState> {

	constructor(props: K, state: L) {
		super(props, state);
	}

	componentDidMount(): void {
		this.setState({
			status: {isOn: true}
		});
	}

	render(): React.ReactNode {

		let value: string = this.state.data ? JSON.stringify(this.state.data, null, "\t") : "No available data";

		return (<View>
			<Text>Level: {value}</Text>
			<Button onPress={() => {
				this.props.peripheral.sendCommand(this.state.status.isOn ? "off" : "on", {});
				this.setState({
					status: {
						isOn: !this.state.status.isOn
					}
				});
			}}
					title={this.state.status.isOn ? "off" : "on"}/>
		</View>);
	}
}
