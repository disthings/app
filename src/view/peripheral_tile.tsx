import * as React from "react";
import {PeripheralTileTitle} from "./peripheral_tile_title";
import {TouchableOpacity, StyleSheet, View, Image, Dimensions} from "react-native";
import {
	PeripheralTileDataClass,
	PeripheralTileProps, PeripheralTileState,
	PeripheralType
} from "../types";
import {Peripheral} from "../model/peripheral";

export class PeripheralTile<K extends PeripheralTileProps, L extends PeripheralTileState>
	extends React.Component<PeripheralTileProps, PeripheralTileState> {

	private subscriberID: string;
	private peripheral: Peripheral;

	constructor(props: K, state: L) {
		super(props, state);

		this.peripheral = props.peripheral;
		this.subscriberID = "peripheral_tile";

		this.state = {
			windowDimensions: Dimensions.get("window")
		};

		this.props.subscribeToLayoutChange(() => {
			this.setState({windowDimensions: Dimensions.get("window")});
		}, this.subscriberID);


	}

	componentWillUnmount(): void {
		this.props.unsubscribeFromLayoutChange(this.subscriberID);
	}

	render(): React.ReactNode {

		const width: any = {width: this.state.windowDimensions.width > this.state.windowDimensions.height ? "30%" : "45%"};
		const backgroundColor: any = {backgroundColor: this.peripheral.getType() === PeripheralType.CLIENT ? "#a0b1ff" : "#aaffa0"};

		let TileData: PeripheralTileDataClass = this.props.peripheralTileData;

		// it is important to pass the class to a variable starting with a capital letter, or else JSX won't recognize it.

		return (<TouchableOpacity onPress={() => {this.props.onPressTile();}} style={[width, styles.tile]}>
					<View style={styles.overlay}>
						<Image
							style={{width: 20, height: 20}}
							source={this.props.peripheral.getType() === PeripheralType.CLIENT ?
								require("../resources/mobile-1976104_200px.png") : require("../resources/home-icon_200px.png")}
						/>
					</View>
					<View style={styles.tileDataContainer}>
						<TileData peripheral={this.props.peripheral} subscribeToLayoutChange={this.props.subscribeToLayoutChange}/>
					</View>
					<PeripheralTileTitle peripheralTitle={this.props.peripheral.getName()} style={[backgroundColor, styles.title]}/>
				</TouchableOpacity>);
	}
}

const styles: any = StyleSheet.create({
	tile: {
		marginLeft: "3%",
		marginTop: 10,
		borderWidth: 1,
		borderColor: "#e6e7e2",
		height: 100
	},
	title: {
		flex: 1,
		bottom: 0,
		minWidth: "100%",
		paddingLeft: 4,
		paddingRight: 4,
		paddingTop: 2,
		paddingBottom: 2,
		alignItems: "center",
		borderTopWidth: 1,
		borderColor: "#e6e7e2",
		fontWeight: "bold"
	},
	tileDataContainer: {
		flex: 3
	},
	overlay: {
		position: "absolute",
		right: 0,
		top: 0,
		opacity: 0.5,
		margin: 3
	},
	text: {
		fontWeight: "bold"
	}
});