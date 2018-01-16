import * as React from "react";
import {TouchableOpacity, StyleSheet, View, Text} from "react-native";
import {MenuBarProps, ViewType} from "../types";

export class MenuBar<K extends MenuBarProps, L extends any> extends React.Component<MenuBarProps, any> {

	private style: any;

	constructor(props: K, state: L) {
		super(props, state);
		this.state = {
			currentView: ViewType.MAIN,
			currentColorTheme: props.currentColorTheme
		};

		props.subscribeOnViewChange((currentView: ViewType) => {
			this.setState({
				currentView: currentView
			});
		});

		props.subscribeToThemeChange((theme: any) => {
			this.setState({
				currentColorTheme: theme
			});
		}, "menu_bar");
	}

	createStyle(): any {
		const menuBarStyle: any = this.state.currentColorTheme.menuBar;
		this.style = StyleSheet.create({
			view: {
				flexDirection: "row"
			},
			button: {
				backgroundColor: menuBarStyle.button.backgroundColor,
				width: "50%",
				height: 40,
				borderLeftWidth: 1,
				borderRightWidth: 1,
				borderBottomWidth: 4,
				borderColor: menuBarStyle.button.borderColor
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
	}

	render(): React.ReactNode {
		this.createStyle();
		return (
			<View style={this.style.view}>
				<TouchableOpacity onPress={() => {
					this.props.onPressHomeButton();
					this.setState({
						currentView: ViewType.MAIN
					});
				}} style={this.style.button}>
					<Text style={this.state.currentView === ViewType.MAIN ?
						this.style.selectedButtonText : this.style.text}>Peripherals</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => {
					this.props.onPressSettingsButton();
					this.setState({
						currentView: ViewType.SETTINGS
					});
				}} style={this.style.button}>
					<Text style={this.state.currentView === ViewType.SETTINGS ?
						this.style.selectedButtonText : this.style.text}>Settings</Text>
				</TouchableOpacity>
			</View>
		);
	}




}