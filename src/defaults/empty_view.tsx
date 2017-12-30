import * as React from "react";
import {View} from "react-native";

export class EmptyView extends React.Component {

	constructor(props: any, state: any) {
		super(props, state);
	}

	render(): React.ReactNode {
		return (<View/>);
	}
}
