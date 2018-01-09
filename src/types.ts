import {iTransaction} from "./model/i_transaction";
import {Peripheral} from "./model/peripheral";
import {ReactNode} from "react";
import {ScaledSize} from "react-native";
import {PeripheralTileData} from "./view/peripheral_tile_data";
import {PeripheralView} from "./view/peripheral_view";
import {iClientPeripheral} from "./model/i_client_peripheral";
import {iServerPeripheral} from "./model/i_server_peripheral";

// enums
export enum PeripheralType {
	SERVER = "SERVER", CLIENT = "CLIENT", EMPTY = "EMPTY"
}

export enum ViewType {
	MAIN = "MAIN", PERIPHERAL = "PERIPHERAL", SETTINGS = "SETTINGS"
}

export enum DatabaseTable {
	DATA = "DATA", BACKUP = "BACKUP"
}

// generic
export interface ObjectLiteral<T> {
	[key: string]: T;
}

export type Iterable<T> = Array<T> | ObjectLiteral<T>;

export interface Message {
	data: Array<any>;
	type: string;
}

export type MessageCallback = (message: Message) => void;

export interface Subscriber {
	callback: SingleArgumentCallback;
	id: string;
}

export type iPeripheralInternal = iClientPeripheral & iServerPeripheral & Peripheral;

export interface PeripheralPartsContainer {
	readonly peripheral: iPeripheralInternal;
	readonly view: Function;
	readonly tile: Function;
	readonly key: string;
}

export interface PeripheralPartsDeclaration {
	readonly peripheral: Function;
	readonly view: Function;
	readonly tile: Function;
}

export interface RequestDataPackage {
	name: string;
	timestamp: number;
	data: any;
	peripheralType: PeripheralType;
}

export interface ResponseDataPackage {
	name: string;
	data: any;
	peripheralType: PeripheralType;
}

export type ErrorCallback = (error: Error) => void;

export type SingleArgumentCallback = (args: any) => void;

export interface WebSocketStartingSettings {
	readonly host: string;
	readonly port: number;
	readonly path: string;
	readonly reconnectionInterval: number;
}

export interface DataManagerStartingSettings {
	readonly dataRetentionInterval: number;
}

export interface WebSocketSettings {
	host: string;
	port: number;
	path: string;
	reconnectionInterval: number;
}

export interface DataManagerSettings {
	dataRetentionInterval: number;
}

export interface Settings {
	maxSkippedIntervals: number;
	dataRequestInterval: number;
	webSocket: WebSocketSettings;
	dataManager: DataManagerSettings;
}

export type UserDataStructure = any;

export interface Command {
	commandName: string;
	commandData: any;
}

// sqLite
export type TransactionCallback = (transaction: iTransaction, result?: UserDataStructure) => void;

// react components
export interface MainViewProps {
	peripherals: Array<PeripheralPartsContainer>;
	onPressTile: (view: ReactNode, peripheral: Peripheral) => void;
	subscribeToLayoutChange: (callback: Function, id: string) => void;
	unsubscribeFromLayoutChange: (id: string) => void;
}

export interface MainViewState {
	peripherals: Array<PeripheralPartsContainer>;
}

export interface ViewContainerState {
	readyToRender: boolean;
	currentView: ViewType;
	windowDimensions: ScaledSize;
	hasIPAddress: boolean;
}

export interface MenuBarProps {
	onPressHomeButton: Function;
	onPressSettingsButton: Function;
	subscribeOnViewChange: Function;
}

export interface PeripheralTileProps {
	peripheral: Peripheral;
	peripheralTileData: any;
	subscribeToLayoutChange: (callback: SingleArgumentCallback, id: string) => void;
	unsubscribeFromLayoutChange: (id: string) => void;
	onPressTile: Function;
	key: string;
}

export interface PeripheralTileState {
	windowDimensions: ScaledSize;
}

export type PeripheralTileDataClass = typeof PeripheralTileData;

export interface PeripheralTileDataState {
	data: any;
	windowDimensions: ScaledSize;
}

export interface PeripheralTileTitleProps {
	peripheralTitle: string;
	style: any;
}

export interface PeripheralViewProps {
	peripheral: Peripheral;
}

export interface PeripheralViewState {
	data: any;
	status: any;
}

export type PeripheralViewClass = typeof PeripheralView;

export interface IPInputFieldProps {
	setNewIP: (ip: string) => void;
}

export interface IPInputFieldState {
	text: string;
}