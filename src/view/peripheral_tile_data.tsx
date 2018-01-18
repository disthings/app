import * as React from "react";
import {Peripheral} from "../model/peripheral";
import {PeripheralTileDataProps, PeripheralTileDataState, SingleArgumentCallback} from "../types";
import {Dimensions} from "react-native";

/*
This is the class that has to be extended to show the data of a peripheral. The title as well as the positioning and
size are managed from the framework.
 */
export abstract class PeripheralTileData<K extends PeripheralTileDataProps, L extends PeripheralTileDataState>
	extends React.Component<PeripheralTileDataProps, PeripheralTileDataState> {

	private peripheral: Peripheral;
	private subscriberID: string;

	constructor(props: K, state: L) {
		super(props, state);

		this.peripheral = props.peripheral;
		this.subscriberID = props.peripheral.getName() + "_tile_data";

		this.state = {
			data: props.peripheral.getTileData(),
			windowDimensions: Dimensions.get("window"),
			currentThemeName: props.currentThemeName
		};

		props.peripheral.subscribeToEvent("newData", () => {
			this.setState({data: props.peripheral.getTileData()});
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

}