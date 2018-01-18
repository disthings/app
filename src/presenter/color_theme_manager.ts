import {Colors, ColorTheme} from "../types";
const colors: Colors = require("../resources/colors");

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
}