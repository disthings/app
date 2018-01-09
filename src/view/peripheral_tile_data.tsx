import * as React from "react";
import {Peripheral} from "../model/peripheral";
import {PeripheralTileDataState, SingleArgumentCallback} from "../types";
import {Dimensions} from "react-native";

/*
This is the class that has to be extended to show the data of a peripheral. The title as well as the positioning and
size are managed from the framework.
 */
export abstract class PeripheralTileData<K extends any, L extends PeripheralTileDataState>
	extends React.Component<any, PeripheralTileDataState> {

	private peripheral: Peripheral;
	private subscriberID: string;

	constructor(props: K, state: L) {
		super(props, state);

		this.peripheral = props.peripheral;
		this.subscriberID = props.peripheral.getName() + "_tile_data";

		this.state = {
			data: props.peripheral.getTileData(),
			windowDimensions: Dimensions.get("window")
		};

		props.peripheral.subscribeToEvent("newData", () => {
			this.setState({data: props.peripheral.getTileData()});
		}, this.subscriberID);
	}

	componentWillUnmount(): void {
		this.peripheral.unsubscribeFromEvent("newData", this.subscriberID);
	}

	/*
	Use this method to subscribe to an event happening at the peripheral. In your peripheral implementation you can
	call the informEventSubscribers method to call your callback.
	 */
	subscribeToEvent(eventName: string, callback: SingleArgumentCallback, id: string): void {
		this.peripheral.subscribeToEvent(eventName, callback, id);
	}

	/*
	Use this method to unsubscribe from an event happening at the peripheral.
	 */
	unsubscribeFromEvent(eventName: string, id: string): void {
		this.peripheral.unsubscribeFromEvent(eventName, id);
	}

}