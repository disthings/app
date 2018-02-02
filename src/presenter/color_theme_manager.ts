import {Colors, ColorTheme} from "../types";
import {DefaultValues} from "../defaults/default_values";
const colors: Colors = require("../resources/colors");

export class ColorThemeManager {

	private currentColorTheme: ColorTheme = DefaultValues.DEFAULT_COLOR_THEME;

	constructor(name: string) {
		this.loadColorTheme(name);
	}

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