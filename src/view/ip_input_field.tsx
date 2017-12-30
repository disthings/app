import * as React from "react";
import {View, TextInput, Text, TouchableOpacity, StyleSheet} from "react-native";
import {IPInputFieldProps, IPInputFieldState} from "../types";
import {IPValidator} from "../ip_validator";
import {Toast} from "../js_to_typescript_adapters/react_native_root_toast";

export class IPInputField<K extends IPInputFieldProps, L extends IPInputFieldState>
	extends React.Component<IPInputFieldProps, IPInputFieldState> {


	constructor(props: K, state: L) {
		super(props, state);
		this.state = {
			text: ""
		};
	}

	render(): React.ReactNode {
		return (<View style={styles.view}>
					<Text style={styles.text}>Please insert the Server's IP</Text>
					<TextInput style={styles.textInput}
							   onChangeText={(newText: string) => { this.setState({text: newText});}}
							   value={this.state.text}
							   autoFocus={true} selectTextOnFocus={true} keyboardType={"numeric"}/>
					<View style={styles.buttonContainer}>
						<TouchableOpacity onPress={() => {
							this.props.setNewIP("0.0.0.0");
							Toast.show("No IP-Address inserted");
						}} style={[styles.button, styles.cancelButton]}>
							<Text style={styles.text}>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => {
							if(IPValidator.isValidIPv4(this.state.text.trim())) {
								this.props.setNewIP(this.state.text.trim());
							}
							else {
								Toast.show("Invalid IP-Address: " + this.state.text);
							}
						}} style={[styles.button, styles.okButton]}>
							<Text style={styles.text}>Ok</Text>
						</TouchableOpacity>
					</View>
				</View>);
	}
}

const styles: any = StyleSheet.create({
	view: {
		backgroundColor: "white",
		borderWidth: 2,
		borderColor: "#E6E7E2"
	},
	button: {
		borderTopWidth: 2,
		padding: 5,
		width: "50%",
		borderColor: "#E6E7E2"
	},
	cancelButton: {
		backgroundColor: "red"
	},
	okButton: {
		backgroundColor: "green"
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