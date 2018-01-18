import {Colors, ColorTheme, ObjectLiteral} from "../types";
const colors: Colors = require("../resources/colors");
const peripheralColors: ObjectLiteral<any> = require("../peripherals/peripherals_colors");

export class ColorThemeManager {

	private currentColorTheme: ColorTheme;

	loadColorTheme(name: string): ColorTheme {
		const colorCandidate: ColorTheme = colors[name];
		if(colorCandidate && colorCandidate.name === name) {
			this.currentColorTheme = colorCandidate;
		}
		return this.currentColorTheme;
	}

	getCurrentColorTheme(): ColorTheme {
		return this.currentColorTheme;
	}

	getAllColorThemes(): Array<string> {
		return Object.keys(colors);
	}

	getPeripheralColorTheme(peripheralName: string): any {
		const currentColorThemeName: string = this.currentColorTheme.name;
		return peripheralColors[peripheralName + "_" + currentColorThemeName];
	}
}