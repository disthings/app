import * as React from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import {PeripheralTile} from "./peripheral_tile";
import {MainViewProps, MainViewState} from "../types";
import {Peripheral} from "../model/peripheral";

/*
This view contains all the peripherals' tiles.
 */
export class MainView<K extends MainViewProps, L extends MainViewState> extends React.Component<MainViewProps, MainViewState> {

	constructor(props: K, state: L) {
		super(props, state);
		this.state = {
			peripherals: this.props.peripherals
		};
	}

	render(): React.ReactNode {

		// map every peripheral to a tile
		const peripheralTiles: any = this.state.peripherals.map(item => (
			<PeripheralTile key={(item.peripheral as Peripheral).getName()}
							subscribeToLayoutChange={this.props.subscribeToLayoutChange}
							unsubscribeFromLayoutChange={this.props.unsubscribeFromLayoutChange}
							subscribeToThemeChange={this.props.subscribeToThemeChange}
							unsubscribeFromThemeChange={this.props.unsubscribeFromThemeChange}
							onPressTile={() => {
								this.props.onPressTile(item.view, item.peripheral as Peripheral);
							}}
							peripheralTileData={item.tile} peripheral={item.peripheral as Peripheral}
							currentColorTheme={this.props.currentColorTheme}
			/>
		));

		return (<ScrollView>
					<View style={styles.view}>
						{peripheralTiles}
					</View>
				</ScrollView>);
	}
}

const styles: any = StyleSheet.create({
	view: {
		flexDirection: "row",
		flex: 1,
		flexWrap: "wrap"
	}
});