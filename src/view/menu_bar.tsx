import * as React from "react";
import {TouchableOpacity , StyleSheet, View, Text} from "react-native";
import {MenuBarProps, ViewType} from "../types";

export class MenuBar<K extends MenuBarProps, L extends any> extends React.Component<MenuBarProps, any> {


	constructor(props: K, state: L) {
		super(props, state);
		this.state = {
			currentView: ViewType.MAIN
		};

		props.subscribeOnViewChange((currentView: ViewType) => {
			this.setState({
				currentView: currentView
			});
		});
	}

	render(): React.ReactNode {
		return (
			<View style={style.view}>
				<TouchableOpacity onPress={() => {
					this.props.onPressHomeButton();
					this.setState({
						currentView: ViewType.MAIN
					});
				}} style={style.button}>
					<Text style={this.state.currentView === ViewType.MAIN ? style.selectedButtonText : style.text}>Peripherals</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => {
					this.props.onPressSettingsButton();
					this.setState({
						currentView: ViewType.SETTINGS
					});
				}} style={style.button}>
					<Text style={this.state.currentView === ViewType.SETTINGS ? style.selectedButtonText : style.text}>Settings</Text>
				</TouchableOpacity>
			</View>
		);
	}
}

const style: any = StyleSheet.create({
	view: {
		flexDirection: "row"
	},
	button: {
		backgroundColor: "#a0ffec",
		width: "50%",
		height: 40,
		borderLeftWidth: 1,
		borderRightWidth: 1,
		borderBottomWidth: 4,
		borderColor: "#E6E7E2"
	},
	selectedButtonText: {
		fontWeight: "bold",
		alignSelf: "center",
		margin: 10
	},
	text: {
		alignSelf: "center",
		margin: 10
	}
});