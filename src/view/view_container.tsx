import * as React from "react";
import {BackHandler, View, Dimensions, StyleSheet, AppState} from "react-native";
import {App} from "../presenter/app";
import {MenuBar} from "./menu_bar";
import {MainView} from "./main_view";
import {iApp} from "../presenter/i_app";
import {SettingsView} from "./settings_view";
import {
	PeripheralPartsContainer, ViewType, ViewContainerState, PeripheralViewClass, SingleArgumentCallback,
	PeripheralPartsDeclaration, ColorTheme
} from "../types";
import {peripherals} from "../peripherals/peripherals_declaration";
import {ReactNode} from "react";
import {Peripheral} from "../model/peripheral";
import {IPInputField} from "./ip_input_field";
import {Publisher} from "../publisher";

/*
This is the container for all what is shown on the screen. It contains a button bar on the top, and a viewport directly
underneath it. In the viewport can the MainView, the IpInputField, the SettingsView or a PeripheralView be shown. This
is also the Component where the App is being instantiated.
 */
export class ViewContainer<K extends any, L extends ViewContainerState> extends React.Component<any, ViewContainerState> {

	private app: iApp;
	private currentView: ReactNode;
	private publisher: Publisher;

	constructor(props: K, state: L) {
		super(props, state);

		this.publisher = new Publisher();
		this.app = new App();
		this.state = {
			readyToRender: false,
			hasIPAddress: false,
			currentView: ViewType.MAIN,
			windowDimensions: Dimensions.get("window"),
			backgroundColor: "#FFFFFF"
		};

		this.app.onReadyToRender((host: string) => { // As soon as the app loaded and is ready to render, the view is informed.
			this.setState({
				readyToRender: true,
				hasIPAddress: host.length > 0,
				backgroundColor: this.app.getCurrentColorTheme().viewContainer.backgroundColor
			});
		});

		peripherals.forEach((peripheralPartsDeclaration: PeripheralPartsDeclaration) => {
			this.app.addPeripheral(peripheralPartsDeclaration);
		});
	}

	componentWillMount(): void {
		BackHandler.addEventListener("hardwareBackPress", () => { // Activate the back-button listener

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
			// console.log("Back pressed");
		});

		AppState.removeEventListener("change", (newState: string) => {
			this.app.managePeripheralDataBasedOnState(newState);
		});
	}

	componentDidMount(): void {
		AppState.addEventListener("change", (newState: string) => { // Listen if the app is in the background, closed or being shown.
			this.app.managePeripheralDataBasedOnState(newState);
		});
	}

	private showPeripheralView(peripheral: Peripheral): void {
		this.app.setCurrentViewType(ViewType.PERIPHERAL);
		this.app.setCurrentPeripheral(peripheral);
		this.setState({currentView: ViewType.PERIPHERAL});
		this.publisher.informEventSubscribers("onViewChange", ViewType.PERIPHERAL);
	}

	private showMainView(): void {
		this.app.setCurrentViewType(ViewType.MAIN);
		this.setState({currentView: ViewType.MAIN});
		this.publisher.informEventSubscribers("onViewChange", ViewType.MAIN);
	}

	private showSettingsView(): void {
		this.app.setCurrentViewType(ViewType.SETTINGS);
		this.setState({currentView: ViewType.SETTINGS});
		this.publisher.informEventSubscribers("onViewChange", ViewType.SETTINGS);
	}

	onLayout(): void {
		this.publisher.informEventSubscribers("onLayout");
	}

	subscribeToLayoutChange(callback: SingleArgumentCallback, id: string): void {
		this.publisher.subscribeToEvent("onLayout", callback, id);
	}

	unsubscribeFromLayoutChange(id: string): void {
		this.publisher.unsubscribeFromEvent("onLayout", id);
	}

	onTheme(theme: ColorTheme): void {
		this.setState({
			backgroundColor: theme.viewContainer.backgroundColor
		});

		this.publisher.informEventSubscribers("onTheme", theme);
	}

	subscribeToThemeChange(callback: SingleArgumentCallback, id: string): void {
		this.publisher.subscribeToEvent("onTheme", callback, id);
	}

	unsubscribeFromThemeChange(id: string): void {
		this.publisher.unsubscribeFromEvent("onTheme", id);
	}

	subscribeOnViewChange(callback: SingleArgumentCallback, subscriberID: string): void {
		this.publisher.subscribeToEvent("onViewChange", callback, subscriberID);
	}

	private showIpInputField(): ReactNode {
		return (<View style={styles.IPviewContainer} onLayout={this.onLayout.bind(this)}>
			<IPInputField
				setNewIP={(ip: string) => {
					this.app.setConnectingIP(ip);
					this.setState({
						hasIPAddress: true
					});
				}}
				currentColorTheme={this.app.getCurrentColorTheme()}
				subscribeToThemeChange={this.subscribeToThemeChange.bind(this)}
				unsubscribeFromThemeChange={this.unsubscribeFromThemeChange.bind(this)}
			/>
		</View>);
	}

	private createCurrentView(): void {
		let clientPeripherals: Array<PeripheralPartsContainer> = this.app.getClientPeripherals();
		let serverPeripherals: Array<PeripheralPartsContainer> = this.app.getServerPeripherals();

		let joinedPeripherals: Array<PeripheralPartsContainer> = clientPeripherals.concat(serverPeripherals);

		switch(this.state.currentView) {
			case ViewType.SETTINGS:
				this.currentView = <SettingsView
					allColorThemes={this.app.getAllColorThemes()}
					currentThemeName={this.app.getCurrentColorTheme().name as string}
					onThemeChosen={(themeName: string) => {
						const colorTheme: ColorTheme = this.app.loadColorTheme(themeName);
						this.onTheme(colorTheme);
					}}
				/>;
				break;
			case ViewType.MAIN:
				this.currentView = <MainView
					peripherals={joinedPeripherals}
					subscribeToLayoutChange={this.subscribeToLayoutChange.bind(this)}
					unsubscribeFromLayoutChange={this.unsubscribeFromLayoutChange.bind(this)}
					subscribeToThemeChange={this.subscribeToThemeChange.bind(this)}
					unsubscribeFromThemeChange={this.unsubscribeFromThemeChange.bind(this)}
					onPressTile={(SomePeripheralView: PeripheralViewClass, peripheral: Peripheral) => {
					// it is important that SomePeripheralView is starting with a capital letter,
					// or else JSX won't recognize it
					this.currentView = <SomePeripheralView
										 peripheral={peripheral}
										 currentThemeName={this.app.getCurrentColorTheme().name}
										 subscribeToLayoutChange={this.subscribeToLayoutChange.bind(this)}
										 subscribeToThemeChange={this.subscribeToThemeChange.bind(this)}
										 unsubscribeFromLayoutChange={this.unsubscribeFromLayoutChange.bind(this)}
										 unsubscribeFromThemeChange={this.unsubscribeFromThemeChange.bind(this)}
									 />;
					this.showPeripheralView(peripheral);
					}}
					currentColorTheme={this.app.getCurrentColorTheme()}
				/>;
				break;
		}
	}

	render(): React.ReactNode {
		if(this.state.readyToRender) {
			if(this.state.hasIPAddress) {
				this.createCurrentView();

				return (
					<View onLayout={this.onLayout.bind(this)} style={{backgroundColor: this.state.backgroundColor, height: "100%"}}>

						<MenuBar onPressHomeButton={() => {this.showMainView();}}
								 onPressSettingsButton={() => {this.showSettingsView();}}
								 subscribeOnViewChange={this.subscribeOnViewChange.bind(this)}
								 subscribeToThemeChange={this.subscribeToThemeChange.bind(this)}
								 currentColorTheme={this.app.getCurrentColorTheme()}
						/>

						{this.currentView /* This is a JSX Object */}
					</View>
				);
			}
			else {
				return this.showIpInputField();  // This is a JSX Object
			}
		}
		else {
			return <View/>;
		}
	}
}

const styles: any = StyleSheet.create({
	IPviewContainer: {
		marginLeft: 50,
		marginRight: 50,
		marginTop: 100,
		marginBottom: 100
	}
});

