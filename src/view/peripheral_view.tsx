import * as React from "react";
import {Peripheral} from "../model/peripheral";
import {PeripheralViewProps, PeripheralViewState, SpreadArgumentsCallback} from "../types";

export abstract class PeripheralView<K extends PeripheralViewProps, L extends PeripheralViewState>
	extends React.Component<PeripheralViewProps, PeripheralViewState> {

	private peripheral: Peripheral;
	private subscriberID: string;

	constructor(props: K, state: L) {
		super(props, state);

		this.peripheral = props.peripheral;
		this.subscriberID = props.peripheral.getName() + "_view";

		this.state = {
			data: props.peripheral.getViewData(),
			status: {}
		};

		props.peripheral.subscribeToEvent("newViewData", () => {
			this.setState({data: props.peripheral.getViewData()});
		}, this.subscriberID);
	}

	componentWillUnmount(): void {
		this.peripheral.unsubscribeFromEvent("newViewData", this.subscriberID);
	}

	subscribeToEvent(eventName: string, callback: SpreadArgumentsCallback, id: string): void {
		this.peripheral.subscribeToEvent(eventName, callback, id);
	}
	unsubscribeFromEvent(eventName: string, id: string): void {
		this.peripheral.unsubscribeFromEvent(eventName, id);
	}

}