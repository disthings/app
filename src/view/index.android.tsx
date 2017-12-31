import * as React from "react";
import {AppRegistry} from "react-native";
import {ViewContainer} from "./view_container";

class Disthings extends React.Component<object, object> {

  render(): React.ReactNode {
    return (
      <ViewContainer/>
    );
  }
}

AppRegistry.registerComponent("disthings", () => Disthings);
