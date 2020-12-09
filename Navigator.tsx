import React from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";

import {
  createAppContainer,
  StackActions,
  NavigationActions,
} from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

import HomeApp from "./views/HomeApp";
import SimpleMap from "./views/SimpleMap";
import Finisher from "./views/Finisher";

class Root extends React.Component<any, any> {
  static DEFAULT_PAGE = "Home";

  componentDidMount() {
    let navigation = this.props.navigation;

    AsyncStorage.getItem("initialRouteName", (err, page) => {
      let params: any = { username: undefined, orgname: undefined };
      if (!page) {
        AsyncStorage.setItem("initialRouteName", Root.DEFAULT_PAGE);
      }
      AsyncStorage.getItem("username", (err, username) => {
        if (username) {
          params.username = username;
        }
        let action = StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: page || Root.DEFAULT_PAGE,
              params: params,
            }),
          ],
          key: null,
        });
        navigation.dispatch(action);
      });
    });
  }
  render() {
    return <View></View>;
  }
}

const AppNavigator = createStackNavigator(
  {
    Root: {
      screen: Root,
    },
    Home: {
      screen: HomeApp,
    },
    SimpleMap: {
      screen: SimpleMap,
    },
    Finisher: {
      screen: Finisher,
    },
  },
  {
    initialRouteName: "Root",
    headerMode: "none",
  }
);

export default createAppContainer(AppNavigator);
