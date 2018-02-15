import {ColorTheme} from "../types";

export const light: ColorTheme = {
	name: "light",
	viewContainer: {
		backgroundColor: "#FFFFFF"
	},
	ipInputField: {
		view: {
			backgroundColor: "#FFFFFF",
			borderColor: "#E6E7E2"
		},
		button: {
			borderColor: "#E6E7E2"
		},
		okButton: {
			backgroundColor: "#008000"
		},
		cancelButton: {
			backgroundColor: "#ff0000"
		}
	},
	menuBar: {
		button: {
			backgroundColor: "#A0FFEC",
			borderColor: "#E6E7E2"
		},
		text: {
			color: "#2B2B2B"
		},
		selectedButtonText: {
			color: "#2B2B2B"
		}
	},
	peripheralTile: {
		tile: {
			borderColor: "#E6E7E2",
			backgroundColorClient: "#A0B1FF",
			backgroundColorServer: "#AAFFA0"
		},
		title: {
			borderColor: "#E6E7E2",
			color: "#2B2B2B"
		}
	},
	settingsView: {
		title: {
			color: "#000000"
		},
		picker: {
			color: "#000000"
		}
	}
};

export const dark: ColorTheme = {
	name: "dark",
	viewContainer: {
		backgroundColor: "#000000"
	},
	ipInputField: {
		view: {
			backgroundColor: "#FFFFFF",
			borderColor: "#E6E7E2"
		},
		button: {
			borderColor: "#E6E7E2"
		},
		okButton: {
			backgroundColor: "#008000"
		},
		cancelButton: {
			backgroundColor: "#ff0000"
		}
	},
	menuBar: {
		button: {
			backgroundColor: "#528278",
			borderColor: "#9C9D9A"
		},
		text: {
			color: "#D3D3D3"
		},
		selectedButtonText: {
			color: "#D3D3D3"
		}
	},
	peripheralTile: {
		tile: {
			borderColor: "#9C9D9A",
			backgroundColorClient: "#525A82",
			backgroundColorServer: "#4F774B"
		},
		title: {
			borderColor: "#9C9D9A",
			color: "#D3D3D3"
		}
	},
	settingsView: {
		title: {
			color: "#FFFFFF"
		},
		picker: {
			color: "#FFFFFF"
		}
	}
};