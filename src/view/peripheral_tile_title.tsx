import * as React from "react";
import {Text} from "react-native";
import {PeripheralTileTitleProps} from "../types";

export class PeripheralTileTitle extends React.Component<PeripheralTileTitleProps, any> {
	render(): React.ReactNode {
		return (<Text style={this.props.style}>{this.props.peripheralTitle}</Text>);
	}
}