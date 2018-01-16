import * as React from "react";
import {ReactNode} from "react";
import {Picker, Text, View} from "react-native";
import {SettingsViewProps} from "../types";

/*
Here will be shown the app settings, and eventually also settings for each peripheral (if there are any, the developers
defines it)
 */
export class SettingsView<K extends SettingsViewProps, L extends any> extends React.Component<SettingsViewProps, any> {


	constructor(props: K, state: L) {
		super(props, state);
		this.state = {
			allColorThemes: this.props.allColorThemes,
			currentThemeName: this.props.currentThemeName
		};
	}

	createThemePicker(): ReactNode {
		const themeItem: any = this.state.allColorThemes.map((item: any) => (
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
					{themeItem}
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