import * as React from "react";
import {View, Text, Button, StyleSheet} from "react-native";
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
			<Text style={colors.textColor}>Level: {value}</Text>
			<Button onPress={() => {
				this.sendCommandToPeripheral({
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
