import {Color, Colors} from "../types";
const colors: Colors = require("../resources/colors");

export class ColorThemeManager {

	private currentColorTheme: any;

	constructor(currentColor: string) {
		this.loadColorTheme(currentColor);
	}

	loadColorTheme(name: string): any {
		const colorCandidate: Color = colors[name];
		if(colorCandidate) {
			colorCandidate.name = name;
			this.currentColorTheme = colorCandidate;
		}
		return this.currentColorTheme;
	}

	getCurrentColorTheme(): any {
		return this.currentColorTheme;
	}

	getAllColorThemes(): Array<string> {
		return Object.keys(colors);
	}
}