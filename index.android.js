import React, { Component } from "react";
import {AppRegistry} from "react-native";
import {ViewContainer} from "./src/view/view_container";

export default class Disthings extends Component {

  render() {
    return (
      <ViewContainer/>
    );
  }
}

AppRegistry.registerComponent("disthings", () => Disthings);
