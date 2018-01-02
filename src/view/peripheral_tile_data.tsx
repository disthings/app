import * as React from "react";
import {Peripheral} from "../model/peripheral";
import {PeripheralTileDataProps, PeripheralTileDataState, SpreadArgumentsCallback} from "../types";
import {Dimensions} from "react-native";

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
			windowDimensions: Dimensions.get("window")
		};

		props.peripheral.subscribeToEvent("newTileData", () => {
			this.setState({data: props.peripheral.getTileData()});
		}, this.subscriberID);
	}

	componentWillUnmount(): void {
		this.peripheral.unsubscribeFromEvent("newTileData", this.subscriberID);
	}

	subscribeToEvent(eventName: string, callback: SpreadArgumentsCallback, id: string): void {
		this.peripheral.subscribeToEvent(eventName, callback, id);
	}
	unsubscribeFromEvent(eventName: string, id: string): void {
		this.peripheral.unsubscribeFromEvent(eventName, id);
	}

}