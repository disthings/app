import * as React from "react";
import {Peripheral} from "../model/peripheral";
import {Command, PeripheralViewProps, PeripheralViewState, SingleArgumentCallback} from "../types";

/*
Extend this class to create the view for your peripheral.
 */
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
			status: {},
			currentThemeName: props.currentThemeName
		};

		props.peripheral.subscribeToEvent("newData", () => {
			this.setState({data: props.peripheral.getViewData()});
		}, this.subscriberID);

		props.subscribeToThemeChange(this.onThemeChange.bind(this), this.subscriberID);
		props.subscribeToLayoutChange(this.onLayoutChange.bind(this), this.subscriberID);
	}

	componentWillUnmount(): void {
		this.peripheral.unsubscribeFromEvent("newData", this.subscriberID);
		this.props.unsubscribeFromThemeChange(this.subscriberID);
		this.props.unsubscribeFromLayoutChange(this.subscriberID);
	}

	private onThemeChange(themeName: string): void {
		this.setState({
			currentThemeName: themeName
		});
	}

	abstract onLayoutChange(layout: string): void;

	/*
	Use this method to subscribe to an event happening at the peripheral. In your peripheral implementation you can
	call the informEventSubscribers method to call your callback.
	 */
	subscribeToPeripheralEvent(eventName: string, callback: SingleArgumentCallback, id: string): void {
		this.peripheral.subscribeToEvent(eventName, callback, id);
	}

	/*
	Use this method to unsubscribe from an event happening at the peripheral.
	 */
	unsubscribeFromPeripheralEvent(eventName: string, id: string): void {
		this.peripheral.unsubscribeFromEvent(eventName, id);
	}

	/*
	Send a command to the peripheral
	 */
	sendCommandToPeripheral(command: Command): void {
		this.peripheral.sendCommand(command);
	}

}