import * as React from "react";
import {View, TextInput, Text, TouchableOpacity, StyleSheet} from "react-native";
import {ColorTheme, IPInputFieldProps, IPInputFieldState, IPInputFieldStyle} from "../types";
import {Toast} from "../js_to_typescript_adapters/react_native_root_toast";
import {isValidIPv4} from "../generic_functions";

export class IPInputField<K extends IPInputFieldProps, L extends IPInputFieldState>
	extends React.Component<IPInputFieldProps, IPInputFieldState> {

	private styles: any;

	constructor(props: K, state: L) {
		super(props, state);
		this.state = {
			text: "",
			currentColorTheme: props.currentColorTheme
		};

		props.subscribeToThemeChange((theme: ColorTheme) => {
			this.setState({
				currentColorTheme: theme
			});
		}, "ip_input_field");

		const ipInputFieldStyle: IPInputFieldStyle = this.state.currentColorTheme.ipInputField;

		this.styles = StyleSheet.create({
			view: {
				backgroundColor: ipInputFieldStyle.view.backgroundColor,
				borderWidth: 2,
				borderColor: ipInputFieldStyle.view.borderColor
			},
			button: {
				borderTopWidth: 2,
				padding: 5,
				width: "50%",
				borderColor: ipInputFieldStyle.button.borderColor
			},
			cancelButton: {
				backgroundColor: ipInputFieldStyle.cancelButton.backgroundColor
			},
			okButton: {
				backgroundColor: ipInputFieldStyle.okButton.backgroundColor
			},
			text: {
				fontSize: 16,
				fontWeight: "bold",
				alignSelf: "center"
			},
			textInput: {
				fontSize: 16,
				width: "80%",
				alignSelf: "center"
			},
			buttonContainer: {
				flexDirection: "row"
			}
		});
	}

	render(): React.ReactNode {
		return (<View style={this.styles.view}>
					<Text style={this.styles.text}>Please insert the Server's IP</Text>
					<TextInput style={this.styles.textInput}
							   onChangeText={(newText: string) => { this.setState({text: newText});}}
							   value={this.state.text}
							   autoFocus={true} selectTextOnFocus={true} keyboardType={"numeric"}/>
					<View style={this.styles.buttonContainer}>
						<TouchableOpacity onPress={() => {
							this.props.setNewIP("0.0.0.0");
							Toast.show("No IP-Address inserted");
						}} style={[this.styles.button, this.styles.cancelButton]}>
							<Text style={this.styles.text}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => {
							if(isValidIPv4(this.state.text.trim())) {
								this.props.setNewIP(this.state.text.trim());
							}
							else {
								Toast.show("Invalid IP-Address: " + this.state.text);
							}
						}} style={[this.styles.button, this.styles.okButton]}>
							<Text style={this.styles.text}>Ok</Text>
						</TouchableOpacity>
					</View>
				</View>);
	}
}