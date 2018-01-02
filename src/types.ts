import {iTransaction} from "./model/i_transaction";
import {iPeripheral} from "./model/i_peripheral";
import {Peripheral} from "./model/peripheral";
import {ReactNode} from "react";
import {ScaledSize} from "react-native";
import {PeripheralTileData} from "./view/peripheral_tile_data";
import {PeripheralView} from "./view/peripheral_view";

// enums
export enum PeripheralType {SERVER = "SERVER", CLIENT = "CLIENT", EMPTY = "EMPTY"}

export enum DataSet {TILE = "TILE", VIEW = "VIEW", NONE = "NONE"}

export enum ViewType {MAIN = "MAIN", PERIPHERAL = "PERIPHERAL", SETTINGS = "SETTINGS"}

export enum Orientation {PORTRAIT = "PORTRAIT", LANDSCAPE = "LANDSCAPE"}

export enum DatabaseTable {DATA = "DATA", BACKUP = "BACKUP"}

// generic
export type Message = {data: Array<any>; type: string;};

export type MessageCallback = (message: Message) => void;

export type Subscriber = {callback: Function; id: string};

export type PeripheralPartsContainer = {peripheral: Peripheral | iPeripheral; view: Function; tile: Function; key: string};

export type RequestDataPackage = {name: string; timestamp: number; data: any; peripheralType: PeripheralType; dataSet: DataSet};

export type ResponseDataPackage = {name: string; data: any; peripheralType: PeripheralType; dataSet: DataSet};

export type ErrorCallback = (error: Error) => void;

export type WebSocketStartingSettings = {
	readonly host: string;
	readonly port: number;
	readonly path: string;
	readonly reconnectionInterval: number;
};
export type LoggerStartingSettings = {readonly isActive: boolean;};

export type DataManagerStartingSettings = {readonly dataRetentionInterval: number;};

export type WebSocketSettings = {
	host: string;
	port: number;
	path: string;
	reconnectionInterval: number;
};

export type LoggerSettings = {isActive: boolean;};

export type DataManagerSettings = {dataRetentionInterval: number;};

export type Settings = {
	maxTryCounter: number;
	dataRequestInterval: number;
	webSocket: WebSocketSettings;
	logger: LoggerSettings;
	dataManager: DataManagerSettings;
};

export type UserDataStructure = any;

// sqLite
export type TransactionCallback = (transaction: iTransaction) => void;

export type QueryResultCallback = (transaction: iTransaction, result: any) => void;
export type QueryResultAsUserDataStructureCallback = (transaction: iTransaction, result: UserDataStructure) => void;

// react components
export type MainViewProps = {
	peripherals: Array<PeripheralPartsContainer>;
	onPressTile: (view: ReactNode, peripheral: iPeripheral) => void;
	subscribeToLayoutChange: (callback: Function, id: string) => void;
	unsubscribeFromLayoutChange: (id: string) => void;
};

export type MainViewState = {peripherals: Array<PeripheralPartsContainer>};

export type ViewContainerState = {
	readyToRender: boolean;
	currentView: ViewType;
	windowDimensions: ScaledSize;
	hasIPAddress: boolean;
};

export type MenuBarProps = {onPressHomeButton: Function; onPressSettingsButton: Function; subscribeOnViewChange: Function};

export type PeripheralTileProps = {
	peripheral: Peripheral;
	peripheralTileData: any;
	subscribeToLayoutChange: (callback: Function, id: string) => void;
	unsubscribeFromLayoutChange: (id: string) => void;
	onPressTile: Function;
	key: string
};

export type PeripheralTileState = {windowDimensions: ScaledSize};

export type PeripheralTileDataClass = typeof PeripheralTileData;

export type PeripheralTileDataProps = {
	peripheral: Peripheral;
	subscribeToLayoutChange: (callback: Function, id: string) => void;
};

export type PeripheralTileDataState = {data: any; windowDimensions: ScaledSize};

export type PeripheralTileTitleProps = {peripheralTitle: string, style: any};

export type PeripheralViewProps = {peripheral: Peripheral};

export type PeripheralViewState = {data: any; status: any};

export type PeripheralViewClass = typeof PeripheralView;

export type IPInputFieldProps = {setNewIP: (ip: string) => void; subscribeToLayoutChange: (callback: Function, id: string) => void;};

export type IPInputFieldState = {text: string;};