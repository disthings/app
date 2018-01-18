import * as React from "react";
import {PeripheralTileTitle} from "./peripheral_tile_title";
import {TouchableOpacity, StyleSheet, View, Image, Dimensions} from "react-native";
import {
	PeripheralTileDataClass,
	PeripheralTileProps, PeripheralTileState, PeripheralTileStyle,
	PeripheralType
} from "../types";
import {Peripheral} from "../model/peripheral";

/*
This is the class for the tiles. It contains a title and the shown data (PeripheralTileData)
 */
export class PeripheralTile<K extends PeripheralTileProps, L extends PeripheralTileState>
	extends React.Component<PeripheralTileProps, PeripheralTileState> {

	private subscriberID: string;
	private peripheral: Peripheral;
	private styles: any;

	constructor(props: K, state: L) {
		super(props, state);

		this.peripheral = props.peripheral;
		this.subscriberID = "peripheral_tile";

		this.state = {
			windowDimensions: Dimensions.get("window"),
			currentColorTheme: props.currentColorTheme
		};

		// the layout change between portrait and landscape is used for defining the width => the way icons are placed.
		this.props.subscribeToLayoutChange(() => {
			this.setState({
				windowDimensions: Dimensions.get("window")
			});
		}, this.subscriberID);

		this.props.subscribeToThemeChange((theme: any) => {
			this.setState({
				currentColorTheme: theme
			});
		}, this.subscriberID);

		const peripheralTileStyle: PeripheralTileStyle = this.state.currentColorTheme.peripheralTile;

		this.styles = StyleSheet.create({
			tile: {
				marginLeft: "3%",
				marginTop: 10,
				borderWidth: 1,
				borderColor: peripheralTileStyle.tile.borderColor,
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
				borderColor: peripheralTileStyle.title.borderColor,
				fontWeight: "bold",
				color: peripheralTileStyle.title.color
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
	}

	componentWillUnmount(): void {
		this.props.unsubscribeFromLayoutChange(this.subscriberID);
		this.props.unsubscribeFromThemeChange(this.subscriberID);
	}

	render(): React.ReactNode {
		const width: any = {width: this.state.windowDimensions.width > this.state.windowDimensions.height ? "30%" : "45%"};
		const backgroundColor: {backgroundColor: string} = {backgroundColor: this.peripheral.getType() === PeripheralType.CLIENT ?
				this.state.currentColorTheme.peripheralTile.tile.backgroundColorClient :
				this.state.currentColorTheme.peripheralTile.tile.backgroundColorServer};

		let TileData: PeripheralTileDataClass = this.props.peripheralTileData;

		// it is important to pass the class to a variable starting with a capital letter, or else JSX won't recognize it.

		return (<TouchableOpacity onPress={() => {this.props.onPressTile();}} style={[width, this.styles.tile]}>
					<View style={this.styles.overlay}>
						<Image
							style={{width: 20, height: 20}}
							source={this.props.peripheral.getType() === PeripheralType.CLIENT ?
								require("../resources/files/mobile-1976104_200px.png") : require("../resources/files/home-icon_200px.png")}
						/>
					</View>
					<View style={this.styles.tileDataContainer}>
						<TileData
							peripheral={this.props.peripheral}
							subscribeToLayoutChange={this.props.subscribeToLayoutChange}
							currentThemeName={this.props.currentColorTheme.name}
						/>
					</View>
					<PeripheralTileTitle peripheralTitle={this.props.peripheral.getName()} style={[backgroundColor, this.styles.title]}/>
				</TouchableOpacity>);
	}
}