import * as React from "react";
import {Picker} from "react-native";
import {ReactNode} from "react";
import {ThemePickerProps, ThemePickerState} from "../../types";

export class ThemePicker<K extends ThemePickerProps, L extends ThemePickerState>
	extends React.Component<ThemePickerProps, ThemePickerState> {

	private subscriberID: string;

	constructor(props: K, state: L) {
		super(props, state);

		this.subscriberID = "theme_picker";

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

	render(): React.ReactNode {

		const themeItems: ReactNode = this.state.allColorThemes.map((item: string) => (
			<Picker.Item key={item}
						 label={item}
						 value={item}
			/>
		));

		return (
			<Picker style={this.state.currentColorTheme.settingsView.picker as any}
					selectedValue={this.state.currentColorTheme.name}
					onValueChange={
						(itemValue, _itemIndex) => {
							this.setState({currentThemeName: itemValue});
							this.props.onThemeChosen(itemValue);
						}
					}>
				{themeItems}
			</Picker>
		);
	}
}