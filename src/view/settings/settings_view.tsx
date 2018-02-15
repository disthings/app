import * as React from "react";
import {ReactNode} from "react";
import {Text, View} from "react-native";
import {SettingsViewProps, SettingsViewState} from "../../types";
import {ThemePicker} from "./theme_picker";

/*
Here will be shown the app settings, and eventually also settings for each peripheral (if there are any, the developers
defines it)
 */
export class SettingsView<K extends SettingsViewProps, L extends SettingsViewState>
	extends React.Component<SettingsViewProps, SettingsViewState> {

	private subscriberID: string;

	constructor(props: K, state: L) {
		super(props, state);

		this.subscriberID = "settings_view";
		this.state = {
			allColorThemes: props.allColorThemes,
			currentColorTheme: props.currentColorTheme,
			currentThemeName: props.currentColorTheme.name
		};

		this.props.subscribeToThemeChange((theme: any) => {
			this.setState({
				currentColorTheme: theme
			});
		}, this.subscriberID);
	}

	componentWillUnmount(): void {
		this.props.unsubscribeFromThemeChange(this.subscriberID);
	}

	createThemePicker(): ReactNode {

		return (
			<View>
				<Text style={this.state.currentColorTheme.settingsView.title}>Choose a theme</Text>
				<ThemePicker allColorThemes={this.props.allColorThemes}
							 currentColorTheme={this.props.currentColorTheme}
							 onThemeChosen={this.props.onThemeChosen}
							 subscribeToThemeChange={this.props.subscribeToThemeChange}
							 unsubscribeFromThemeChange={this.props.unsubscribeFromThemeChange}
				/>
			</View>
		);
	}

	render(): ReactNode {
		return (
			this.createThemePicker()
		);
	}
}