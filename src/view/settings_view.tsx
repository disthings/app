import * as React from "react";
import {ReactNode} from "react";
import {Picker, Text, View} from "react-native";
import {SettingsViewProps, SettingsViewState} from "../types";

/*
Here will be shown the app settings, and eventually also settings for each peripheral (if there are any, the developers
defines it)
 */
export class SettingsView<K extends SettingsViewProps, L extends SettingsViewState>
	extends React.Component<SettingsViewProps, SettingsViewState> {


	constructor(props: K, state: L) {
		super(props, state);
		this.state = {
			allColorThemes: this.props.allColorThemes,
			currentThemeName: this.props.currentThemeName
		};
	}

	createThemePicker(): ReactNode {
		const themeItems: ReactNode = this.state.allColorThemes.map((item: string) => (
			<Picker.Item key={item}
						 label={item}
						 value={item}
			/>
		));
		return (
			<View>
				<Text>Choose a theme</Text>
				<Picker
					selectedValue={this.state.currentThemeName}
					onValueChange={
						(itemValue, _itemIndex) => {
							this.setState({currentThemeName: itemValue});
							this.props.onThemeChosen(itemValue);
						}
					}>
					{themeItems}
				</Picker>
			</View>
		);
	}

	render(): ReactNode {
		return (
			this.createThemePicker()
		);
	}

}