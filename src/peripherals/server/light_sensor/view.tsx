import * as React from "react";
import {View, Text, Button} from "react-native";
import {PeripheralView} from "../../../view/peripheral_view";
import {PeripheralViewState} from "../../../types";

export class LightView extends PeripheralView<any, PeripheralViewState> {

	constructor(props: any, state: any) {
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
				this.sendCommand({
					commandName: this.state.status.isOn ? "off" : "on",
					commandData: {}
				});
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
