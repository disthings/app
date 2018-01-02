import * as React from "react";
import {BackHandler, View, Dimensions, StyleSheet, AppState} from "react-native";
import {App} from "../presenter/app";
import {MenuBar} from "./menu_bar";
import {MainView} from "./main_view";
import {iApp} from "../presenter/i_app";
import {SettingsView} from "./settings_view";
import {
	PeripheralPartsContainer, PeripheralType, ViewType, ViewContainerState, Subscriber,
	PeripheralViewClass
} from "../types";
import {peripherals} from "../peripherals/peripherals_declaration";
import {ReactNode} from "react";
import {Peripheral} from "../model/peripheral";
import {IPInputField} from "./ip_input_field";

export class ViewContainer<K extends any, L extends ViewContainerState> extends React.Component<any, ViewContainerState> {

	private app: iApp;
	private currentView: ReactNode;
	private onLayoutChangeSubscribers: Array<Subscriber>;
	private onViewChangeCallback: Function;

	constructor(props: K, state: L) {
		super(props, state);

		this.state = {
			readyToRender: false,
			hasIPAddress: false,
			currentView: ViewType.MAIN,
			windowDimensions: Dimensions.get("window")
		};
		this.app = new App();
		this.app.onReadyToRender((host: string) => {
			this.setState({
				readyToRender: true,
				hasIPAddress: host.length > 0
			});
		});

		this.onLayoutChangeSubscribers = [];

		peripherals.forEach((peripheralPartsContainer: PeripheralPartsContainer) => {
			let peripheral: Peripheral = peripheralPartsContainer.peripheral as Peripheral;
			if(peripheral.getType() === PeripheralType.CLIENT) {
				this.app.addClientPeripheral(peripheralPartsContainer);
			}
			else {
				this.app.addServerPeripheral(peripheralPartsContainer);
			}
		});
	}

	componentWillMount(): void {
		BackHandler.addEventListener("hardwareBackPress", () => {

			if (this.app.getCurrentViewType() === ViewType.MAIN) {
				BackHandler.exitApp();
				return false;
			}
			this.showMainView();
			return true;
		});
	}

	componentWillUnmount(): void {
		BackHandler.removeEventListener("hardwareBackPress", () => {
			// Logger.log("");
		});

		AppState.removeEventListener("change", (newState: string) => {
			this.app.setAppState(newState);
		});
	}

	componentDidMount(): void {
		AppState.addEventListener("change", (newState: string) => {
			this.app.setAppState(newState);
		});
	}

	private showPeripheralView(peripheral: Peripheral): void {
		this.app.setCurrentViewType(ViewType.PERIPHERAL);
		this.app.setCurrentPeripheral(peripheral);
		this.setState({currentView: ViewType.PERIPHERAL});
		this.onViewChangeCallback(ViewType.PERIPHERAL);
	}

	private showMainView(): void {
		this.app.setCurrentViewType(ViewType.MAIN);
		this.setState({currentView: ViewType.MAIN});
		this.onViewChangeCallback(ViewType.MAIN);
	}

	private showSettingsView(): void {
		this.app.setCurrentViewType(ViewType.SETTINGS);
		this.setState({currentView: ViewType.SETTINGS});
		this.onViewChangeCallback(ViewType.SETTINGS);
	}

	onLayout(_event: Event): void {
		this.onLayoutChangeSubscribers.forEach((sub: Subscriber) => {
			sub.callback();
		});
	}

	subscribeToLayoutChange(callback: Function, id: string): void {
		this.onLayoutChangeSubscribers.push({
			callback: callback,
			id: id
		});
	}

	unsubscribeFromLayoutChange(id: string): void {
		let found: boolean = false;
		let i: number = 0;

		while(!found && i < this.onLayoutChangeSubscribers.length) {
			let sub: Subscriber = this.onLayoutChangeSubscribers[i];
			if(found = sub.id === id) {
				this.onLayoutChangeSubscribers.splice(i, 1);
			}
			i++;
		}
	}

	subscribeOnViewChange(callback: Function): void {
		this.onViewChangeCallback = callback;
	}

	unsubscribeOnViewChange(): void {
		delete this.onViewChangeCallback;
	}

	render(): React.ReactNode {

		if(this.state.readyToRender) {
			if(this.state.hasIPAddress) {
				let clientPeripherals: Array<PeripheralPartsContainer> = this.app.getClientPeripherals();
				let serverPeripherals: Array<PeripheralPartsContainer> = this.app.getServerPeripherals();

				let joinedPeripherals: Array<PeripheralPartsContainer> = clientPeripherals.concat(serverPeripherals);

				switch(this.state.currentView) {
					case ViewType.SETTINGS:
						this.currentView = <SettingsView/>;
						break;
					case ViewType.MAIN:
						this.currentView = <MainView peripherals={joinedPeripherals}
													 subscribeToLayoutChange={this.subscribeToLayoutChange.bind(this)}
													 unsubscribeFromLayoutChange={this.unsubscribeFromLayoutChange.bind(this)}
													 onPressTile={(SomePeripheralView: PeripheralViewClass, peripheral: Peripheral) => {
														 // it is important that SomePeripheralView is starting with a capital letter,
														 // or else JSX won't recognize it.
														 this.currentView = <SomePeripheralView peripheral={peripheral}/>;
														 this.showPeripheralView(peripheral);
													 }}/>;
						break;
				}
				return (
					<View onLayout={this.onLayout.bind(this)}>
						<MenuBar onPressHomeButton={() => {
							this.showMainView();
						}} onPressSettingsButton={() => {
							this.showSettingsView();
						}}
						subscribeOnViewChange={this.subscribeOnViewChange.bind(this)}
						/>
						{this.currentView}
					</View>
				);
			}
			else {
				return (<View style={styles.IPview} onLayout={this.onLayout.bind(this)}>
					<IPInputField setNewIP={(ip: string) => {
						this.app.setNewIP(ip);
						this.setState({
							hasIPAddress: true
						});
					}} subscribeToLayoutChange={this.subscribeToLayoutChange.bind(this)}/>
				</View>);
			}
		}
		else {
			return <View/>;
		}

	}
}

const styles: any = StyleSheet.create({
	IPview: {
		marginLeft: 50,
		marginRight: 50,
		marginTop: 100,
		marginBottom: 100
	}
});