import * as React from "react";
import {ReactNode} from "react";
import {Text} from "react-native";

/*
Here will be shown the app settings, and eventually also settings for each peripheral (if there are any, the developers
defines it)
 */
export class SettingsView extends React.Component<any, any> {

	render(): ReactNode {
		return (
			<Text>Settings View</Text>
		);
	}

}