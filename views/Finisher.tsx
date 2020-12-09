import React, { Component } from "react";
import * as Font from "expo-font";
import { NavigationActions, StackActions } from "react-navigation";
import {
  StyleSheet,
  View,
  Animated,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { Root } from "popup-ui";
import { Container, Text, Button } from "native-base";
import MapView, { Marker, Polyline } from "react-native-maps";
import i18n from "i18n-js";
const haversine = require("haversine");

AsyncStorage.getItem("locale").then((res) => {
  i18n.locale = res || "es";
});
i18n.fallbacks = true;

type IProps = {
  navigation: any;
};

type IState = {
  started?: boolean;
  enabled?: boolean;
  isMoving?: boolean;
  showsUserLocation?: boolean;
  motionActivity: MotionActivityEvent;
  odometer: number;
  distance: number;
  activity: Object;
  coordinates: Array<any>;
  token: Array<any>;
  markers: Object;
};

const LATITUDE_DELTA = 0.00922;
const LONGITUDE_DELTA = 0.00421;

export default class SimpleMap extends Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      activity: this.props.navigation.state.params.activity,
      token: this.props.navigation.state.params.token,
      markers: this.props.navigation.state.params.markers,
      coordinates: this.props.navigation.state.params.coordinates,
      distance: this.props.navigation.state.params.distance,
      error: "",
      fontLoaded: false,
    };
  }
  setCenter(location: Location) {
    if (!this.refs.map) {
      return;
    }
    this.refs.map.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: LATITUDE_DELTA / 1.8,
      longitudeDelta: LONGITUDE_DELTA * 0.8,
    });

  }
  async componentDidMount() {
    try {
      await Font.loadAsync({
        "Druk Wide Medium": require("../assets/fonts/druk/3724259186746d86859fbb0fde0fa44a.ttf"),
        montserratLight: require("../assets/fonts/montserrat/Montserrat-Light.ttf"),
        montserratMedium: require("../assets/fonts/montserrat/Montserrat-Medium.ttf"),
        Roboto: require("native-base/Fonts/Roboto.ttf"),
        Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      });
      this.setState({ fontLoaded: true });
    } catch (error) {
      console.log("error loading fonts", error);
    }
    this.setState({
      token: this.props.navigation.state.params.token,
      markers: this.props.navigation.state.params.markers,
      coordinates: this.props.navigation.state.params.coordinates,
      distance: this.props.navigation.state.params.distance,
    });

    this.refs.map.fitToCoordinates(
      this.props.navigation.state.params.coordinates,
      {
        edgePadding: { top: 10, right: 10, bottom: 10, left: 10 },
        animated: false,
      }
    );
  }

  _onClickOpenWebsite() {
    let url = "https://yourapiserver.com/login/";
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  }
  async _onClickHome() {
    AsyncStorage.setItem("initialRouteName", "Home");
    let action = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: "Home" })],
      key: null,
    });
    this.props.navigation.dispatch(action);
  }
  render() {
    return (
      <Root>
        <Container style={styles.container}>
          <Animated.View View style={styles.animated}>
            <View>
              <Text style={styles.title}>{i18n.t("congrats")}</Text>
              <Text style={styles.subtitle}>
                {i18n.t("completed", { kms: this.state.distance })}
              </Text>
            </View>
          </Animated.View>

          <Button
            full
            onPress={() => this._onClickOpenWebsite()}
            style={styles.button}
          >
            <Text>{i18n.t("download_certificate")}</Text>
          </Button>
          <Button
            full
            onPress={() => this._onClickHome()}
            style={styles.button_back}
          >
            <Text>{i18n.t("back_home")}</Text>
          </Button>
          <MapView
            ref="map"
            style={styles.map}
            showsUserLocation={false}
            followsUserLocation={false}
            scrollEnabled={true}
            showsMyLocationButton={false}
            showsPointsOfInterest={false}
            showsScale={true}
            showsTraffic={false}
            toolbarEnabled={false}
          >
            <Polyline
              key={this.state.coordinates}
              coordinates={this.state.coordinates}
              geodesic={true}
              strokeColor="#FFA820"
              strokeWidth={6}
              zIndex={0}
            />
            <Marker
              key="1"
              coordinate={this.state.markers[0].coordinate}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[styles.markerIcon]}></View>
            </Marker>

            <Marker
              key="1"
              coordinate={
                this.state.markers[this.state.markers.length - 1].coordinate
              }
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[styles.markerIconFinish]}></View>
            </Marker>
          </MapView>
        </Container>
      </Root>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    padding: 30,
    // paddingTop: 80,
    textAlign: "center",
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Druk Wide Medium",
    fontSize: 35,
    lineHeight: 45,
    color: "#444444",
    marginTop: 5,
    marginLeft: 0,
    letterSpacing: -3,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "montserratLight",
    fontSize: 18,
    lineHeight: 25,
    color: "#444444",
    marginTop: 5,
    marginLeft: 0,
    textAlign: "center",
    // marginLeft: 1,
  },
  button: {
    fontFamily: "montserratMedium",
    backgroundColor: "#3730A3",
    borderRadius: 28,
    fontSize: 1,
    color: "#FFFFFF",
    letterSpacing: 2.18,
    textAlign: "center",
    lineHeight: 24,
    marginTop: 50,
    textTransform: "uppercase",
  },
  button_back: {
    fontFamily: "montserratMedium",
    backgroundColor: "#444444",
    borderRadius: 28,
    fontSize: 1,
    color: "#FFFFFF",
    letterSpacing: 2.18,
    textAlign: "center",
    lineHeight: 24,
    marginTop: 10,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  map: {
    zIndex: -1,
    paddingTop: 60,
    paddingLeft: 20,
    borderRadius: 40,
    height: 300,
    marginTop: 30,
  },
  markerIcon: {
    borderWidth: 1,
    borderColor: "#16a085",
    backgroundColor: "#2ecc71",
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
  },
  markerIconFinish: {
    borderWidth: 1,
    borderColor: "#c0392b",
    backgroundColor: "#e74c3c",
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
  },
});
