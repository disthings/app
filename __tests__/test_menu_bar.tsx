import "react-native";
import * as React from "react";
import {MenuBar} from "../src/view/menu_bar";

// Note: test renderer must be required after react-native.
import * as renderer from "react-test-renderer";


test("renders correctly", () => {
	const tree = renderer.create(<MenuBar
		onPressHomeButton={() => {console.log("HOME");}}
		onPressSettingsButton={() => {console.log("SETTINGS");}}
		subscribeOnViewChange={() => {console.log("VIEW_CHANGE");}}
	/>).toJSON();
	expect(tree).toMatchSnapshot();
});