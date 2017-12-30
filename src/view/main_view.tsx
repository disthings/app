import * as React from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import {PeripheralTile} from "./peripheral_tile";
import {MainViewProps, MainViewState} from "../types";
import {Peripheral} from "../model/peripheral";

export class MainView<K extends MainViewProps, L extends MainViewState> extends React.Component<MainViewProps, MainViewState> {

	constructor(props: K, state: L) {
		super(props, state);

		this.state = {
			peripherals: this.props.peripherals
		};
	}

	render(): React.ReactNode {

		const peripheralTiles: any = this.state.peripherals.map(item => (
			<PeripheralTile key={(item.peripheral as Peripheral).getName()}
							subscribeToLayoutChange={this.props.subscribeToLayoutChange}
							unsubscribeFromLayoutChange={this.props.unsubscribeFromLayoutChange}
							onPressTile={() => {
								this.props.onPressTile(item.view, item.peripheral as Peripheral);
							}}
							peripheralTileData={item.tile} peripheral={item.peripheral as Peripheral}/>
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