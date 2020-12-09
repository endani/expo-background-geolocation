import React, { Component } from "react";
import axios from "axios";
import * as Font from "expo-font";
import { EventEmitter } from "fbemitter";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import * as TaskManager from "expo-task-manager";
import * as Battery from "expo-battery";
import { NavigationActions, StackActions } from "react-navigation";
import * as Notifications from "expo-notifications";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
  Alert,
  Vibration,
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { Root, Popup, Toast } from "popup-ui";
import { Container, Text } from "native-base";
import {  MaterialIcons, EvilIcons } from "@expo/vector-icons";
import MapView, { Marker, Polyline } from "react-native-maps";
import ENV from "../ENV";
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
  showsUserLocation?: boolean;
  odometer: number;
  distance: number;
  activity: Object;
  coordinates: Array<any>;
  token: Array<any>;
  markers: Object;
};

const LATITUDE_DELTA = 0.00922;
const LONGITUDE_DELTA = 0.00421;
const LOCATION_TASK_NAME = "background-location-task";
const taskEventName = "task-update";
const eventEmitter = new EventEmitter();

export default class SimpleMap extends Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      debug: false,
      started: false,
      enabled: false,
      distance: this.props.navigation.state.params.distance,
      token: this.props.navigation.state.params.token,
      odometer: 0,
      markers: [],
      coordinates: [],
      showsUserLocation: false,

      region: null,
      error: "",
      fontLoaded: false,
    };
    this.spinValue = new Animated.Value(0);
    this._runAnimation();

    this.eventSubscription = eventEmitter.addListener(taskEventName, (data) =>
      this._addMarker(data)
    );
  }
  async componentDidMount() {
    try {
      this.setState({
        token: this.props.navigation.state.params.token,
      });

      await Font.loadAsync({
        "Druk Wide Medium": require("../assets/fonts/druk/3724259186746d86859fbb0fde0fa44a.ttf"),
        montserratLight: require("../assets/fonts/montserrat/Montserrat-Light.ttf"),
        montserratMedium: require("../assets/fonts/montserrat/Montserrat-Medium.ttf"),
        Roboto: require("native-base/Fonts/Roboto.ttf"),
        Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      });
      this.setState({ fontLoaded: true });
      const { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        this.setCenter(location);
      } else {
        Toast.show({
          type: "Danger",
          title: "Locations services needed",
          color: "#e74c3c",
          timing: 2000,
          icon: <EvilIcons name="close" size={25} color="white" />,
        });
        return false;
      }
    } catch (error) {
      console.log("error loading", error);
    }
  }
  async componentWillUnmount() {
    let isRegistered = await TaskManager.isTaskRegisteredAsync(
      LOCATION_TASK_NAME
    );
    if (isRegistered) Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);

    this.eventSubscription.remove();
    this._stopLocationAsync();
  }
  async _stopTracking() {
    try {
      const response = await axios.post(
        ENV.HOST + "/api/stopTracking",
        {
          distance: this.state.odometer / 1000,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${this.state.token.access_token}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
  async _onToggleEnabled() {
    let enabled = !this.state.enabled;

    this.setState({
      enabled: enabled,
    });

    if (enabled) {
      if (!this.state.started) {
        this.setState({
          started: true,
          showsUserLocation: false,
          coordinates: [],
          markers: [],
        });

        try {
          // Update with your tracking method

          // const response = await axios.post(
          //   ENV.HOST + "/api/startTracking",
          //   {
          //     distance: this.state.distance,
          //   },
          //   {
          //     headers: {
          //       Accept: "application/json",
          //       Authorization: `Bearer ${this.state.token.access_token}`,
          //     },
          //   }
          // );
          const response = {
            data: {
              activity: 'activity'
            }
          }
          if (response.data) {
            Vibration.vibrate([1000, 2000, 3000]);
            AsyncStorage.setItem(
              "activity",
              JSON.stringify(response.data.activity)
            );
            this._getLocationAsync(true);
            this.setState({
              activity: response.data.activity,
              showsUserLocation: true,
              odometer: 0,
            });
          }
        } catch (error) {
          
        }
      } else {
        this._getLocationAsync(false);
      }
    } 
  }
  _getLocationAsync = async (firstTime) => {

    if (firstTime) {
      await this.setState({
        markers: [],
        coordinates: [],
      });

      Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Highest,
        distanceInterval: 50,
        timeInterval: 5000,
        showsBackgroundLocationIndicator: true,
        pausesUpdatesAutomatically: true,
        activityType: Location.ActivityType.Fitness,
        foregroundService: {
          notificationTitle: i18n.t("on_race"),
          notificationBody: i18n.t("on_race_text"),
        },
      });

      let location = await Location.getCurrentPositionAsync({});
      this._addMarker(location);
    }
  };
  _stopLocationAsync = async () => {
    this.setState({
      markers: [],
      coordinates: [],
    });
  };
  async _addMarker(location: Location) {
    if (location) {
      if (this.state.debug) {
        Notifications.presentNotificationAsync({
          title: "[Location update]",
          body: `${location.coords.latitude}/${location.coords.longitude}`,
        });
      }

      if (this.state.enabled) {
        try {
          this.setCenter(location);
          let calculatedDistance;
          let marker = {
            key: location.timestamp * Math.random(1, 20),
            heading: location.coords.heading,
            speed: location.coords.speed,
            accuracy: location.coords.accuracy,
            coordinate: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
          };

          this.setState({
            markers: [...this.state.markers, marker],
            coordinates: [
              ...this.state.coordinates,
              {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              },
            ],
          });

          if (this.state.markers.length > 1) {
            calculatedDistance = Math.abs(
              haversine(
                this.state.markers[this.state.markers.length - 2].coordinate,
                location.coords,
                { unit: "meter" }
              )
            );
            this.setState({
              odometer: this.state.odometer += calculatedDistance,
            });
          } else {
            this.setState({ odometer: 0 });
          }

          const batteryLevel = await Battery.getBatteryLevelAsync();
    
          if (this.state.odometer / 1000 >= this.state.activity.goal) {

            let isRegistered = await TaskManager.isTaskRegisteredAsync(
              LOCATION_TASK_NAME
            );
            if (isRegistered)
              Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            await this.eventSubscription.remove();

            await this._stopTracking();

            Vibration.vibrate([1000, 5000, 3000]);

            Notifications.presentNotificationAsync({
              title: i18n.t("congrats"),
              body: i18n.t("completed", { kms: this.state.distance }),
              vibrationPattern: [0, 250, 250, 250],
              shouldPlaySound: true,
            });

            let action = StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: "Finisher",
                  params: {
                    token: this.state.token,
                    activity: this.state.activity,
                    coordinates: this.state.coordinates,
                    markers: this.state.markers,
                  },
                }),
              ],
              key: null,
            });
            this.props.navigation.dispatch(action);

          }
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      return true;
    }
  }
  setCenter(location: Location) {
    if (!this.refs.map) {
      return;
    }
    this.refs.map.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  }
  _runAnimation = () => {
    this.spinValue.setValue(0);
    Animated.timing(this.spinValue, {
      toValue: 3,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  };
  async _onClickHome() {
    AsyncStorage.setItem("initialRouteName", "Home");
    let action = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: "Home" })],
      key: null,
    });

    if (this.state.started) {
      Alert.alert(
        i18n.t("not_finished"),
        i18n.t("are_you_sure"),
        [
          {
            text: i18n.t("cancel"),
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: i18n.t("exit"),
            onPress: async () => {
              this._stopTracking();
              let isRegistered = await TaskManager.isTaskRegisteredAsync(
                LOCATION_TASK_NAME
              );
              if (isRegistered)
                Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
              this._stopLocationAsync();
              this.setState({
                odometer: 0,
              });
              this.props.navigation.dispatch(action);
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      this.props.navigation.dispatch(action);
    }
  }
  render() {
    return (
      <Root>
        <Container style={styles.container}>
          <MapView
            ref="map"
            style={styles.map}
            showsUserLocation={true}
            followsUserLocation={false}
            scrollEnabled={true}
            showsMyLocationButton={false}
            showsPointsOfInterest={false}
            showsScale={false}
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
            {this.state.markers.map((marker: any) => (
              <Marker
                key={
                  marker.key +
                  "_" +
                  marker.coordinate.latitude +
                  "_" +
                  marker.coordinate.longitude
                }
                coordinate={marker.coordinate}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={[styles.markerIcon]}></View>
              </Marker>
            ))}

          </MapView>

          {!this.state.enabled ? (
            <TouchableOpacity
              onPress={() => this._onClickHome()}
              style={{
                position: "absolute",
                top: 50,
                right: 10,
                borderRadius: 40,
                backgroundColor: "red",
                textAlign: "center",
                padding: 20,
                paddingTop: 10,
                paddingBottom: 10,
              }}
            >
              <Text style={{ color: "white", fontSize: 18 }}>
                {i18n.t("exit")}
              </Text>
            </TouchableOpacity>
          ) : null}

          <Animated.View View style={styles.animated}>
            <View>
              <Text style={styles.value}>
                {Number.parseFloat(this.state.odometer) < 1000
                  ? this.state.odometer.toFixed(0) + " m"
                  : Number.parseFloat(this.state.odometer / 1000).toFixed(3) +
                    " km"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => this._onToggleEnabled()}>
              <MaterialIcons
                name={
                  this.state.enabled
                    ? "pause-circle-filled"
                    : "play-circle-filled"
                }
                size={80}
                color="#3730A3"
                style={styles.outerCircle}
              />
            </TouchableOpacity>
          </Animated.View>
        </Container>
      </Root>
    );
  }
}

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    return;
  }
  if (data) {
    const { locations } = data;
    eventEmitter.emit(taskEventName, locations[0]);
  }
});
const options = {
  text: {
    fontFamily: "montserratMedium",
    fontSize: 20,
    lineHeight: 35,
    color: "#444444",
    marginBottom: 5,
  },
};
var styles = StyleSheet.create({
  title: {
    fontSize: 12,
    color: "#666666",
    textTransform: "uppercase",
  },
  value: {
    fontFamily: "Druk Wide Medium",
    fontSize: 38,
    lineHeight: 45,
    color: "#444444",
    marginTop: 5,
    marginLeft: 0,
    letterSpacing: -3,
  },
  value_small: {
    fontSize: 18,
    lineHeight: 35,
    color: "#444444",
    marginTop: 5,
    marginLeft: 0,
  },
  subvalue: {
    fontSize: 16,
    lineHeight: 16,
    color: "#444444",
    marginTop: 0,
    marginLeft: 0,
  },
  markerIcon: {
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "rgba(255,168,32, 0.6)",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footerBody: {
    justifyContent: "center",
    width: 200,
    flex: 1,
  },
  map: {
    flex: 1,
    zIndex: -1,
    paddingTop: 60,
    paddingLeft: 20,
  },
  icon: {
    borderRadius: 50,
  },
  goback: {
    position: "absolute",
    top: 100,
    left: 80,
    zIndex: 10,
    backgroundColor: "rgba(255,168,32, 0.6)",
    width: 60,
    height: 60,
  },
  animated: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 10,
    padding: 15,
  },
  status: {
    textAlign: "center",
  },
});
