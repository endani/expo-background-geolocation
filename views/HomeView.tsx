import React from "react";
import { Component } from "react";
import Constants from "expo-constants";
import * as Font from "expo-font";
import axios from "axios";
import {
  StyleSheet,
  Alert,
  View,
  Image,
  Dimensions,
  ImageBackground,
  Vibration,
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { NavigationActions, StackActions } from "react-navigation";
import { Body, Text, H1, Button } from "native-base";
import { SimpleLineIcons, Fontisto } from "@expo/vector-icons";
import * as Permissions from "expo-permissions";
import * as Notifications from "expo-notifications";
import i18n from "i18n-js";
import ENV from "../ENV";

i18n.translations = {
  es: {
    select_language: "Selecciona tu idioma",
    select_language_list: "",
    select_distance: "Selecciona la distancia",
    will_disconnect: "Te desconectarás",
    are_you_sure: "¿Seguro que quieres salir?",
    cancel: "Cancelar",
    logout: "Salir",

    access: "Acceder",
    access_details: "Introduce tu email y tu contraseña",
    access_btn: "Acceder",
    email: "Correo electrónico",
    inscription_code: "Contraseña",
    wrong_format: "El formato no es correcto",
    wrong_lenth: "La Contraseña debe tener 7 caracteres",
    required_field: "Campo obligatorio",

    on_race: "Registrando carrera",
    on_race_text: "Estamos obteniendo tu localización en segundo plano.",
    congrats: "¡Enhorabuena!",
    completed: "Has completado la Carrera de La Mercè virtual.",
    not_finished: "Tu carrera aún no ha acabado",
    are_you_sure: "¿Seguro que quieres salir?",
    cancel: "Cancelar",
    exit: "Salir",

    download_certificate: "Descargar certificado finisher",
    back_home: "Volver",
  },
  ca: {
    select_language: "Selecciona el teu idioma",
    select_language_list: "",
    select_distance: "Escull la teva distància",
    will_disconnect: "Et desconnectaràs",
    are_you_sure: "Segur que vols sortir?",
    cancel: "Cancel·la",
    logout: "Sortir",
    exit: "Salir",

    access: "Accedeix-hi",
    access_details: "Introdueix el teu email i codi d'inscripció",
    access_btn: "Accedir",
    email: "Adreça electrònica",
    inscription_code: "Codi d'inscripció",
    wrong_format: "El format no és correcte",
    wrong_lenth: "El codi d'inscripció ha de tenir 7 caràcters",
    required_field: "Camp obligatori",

    on_race: "Enregistrant cursa",
    on_race_text: "Estem obtenint la teva localització en segon pla.",
    not_finished: "La teva cursa encara no ha acabat",
    are_you_sure: "Segur que vols sortir-ne?",
    cancel: "Cancel·la",
    exit: "Sortir",

    congrats: "Enhorabona!",
    completed: "Has completat la Cursa de la Mercè virtual",
    download_certificate: "Descarregar certificat finisher",
    back_home: "Tornar a l'inici",
  },
};

AsyncStorage.getItem("locale").then((res) => {
  i18n.locale = res || "es";
});
i18n.fallbacks = true;

type IProps = {
  navigation: any;
};
type IState = {
  locale: string;
  user: Object;
  token: Object;
  email: string;
  inscription_id: string;
  deviceManufacturer: string;
  deviceModel: string;
  deviceIdentifier: string;
};

export default class HomeView extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    let navigation = props.navigation;
    this.state = {
      token: {},
      user: {},
      deviceModel: "",
      deviceManufacturer: "",
      deviceIdentifier: "",
      email: "",
      inscription_id: "",
      fontLoaded: false,
    };
  }
  async componentDidMount() {
    try {
      let token = await AsyncStorage.getItem("token");
      await Permissions.askAsync(Permissions.LOCATION);
      const permission = await Notifications.requestPermissionsAsync();
      // Notifications.requestPermissionsAsync();

      if (token) {
        this.setState({
          token: JSON.parse(token),
        });
      } else {
        this._register();
      }
      await Font.loadAsync({
        "Druk Wide Medium": require("../assets/fonts/druk/3724259186746d86859fbb0fde0fa44a.ttf"),
        montserratLight: require("../assets/fonts/montserrat/Montserrat-Light.ttf"),
        montserratMedium: require("../assets/fonts/montserrat/Montserrat-Medium.ttf"),
        Roboto: require("native-base/Fonts/Roboto.ttf"),
        Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      });
      this.setState({ fontLoaded: true });
    } catch (error) {
      console.log(error);
    }

    // await AsyncStorage.removeItem("locale");
  }
  async _Logout() {
    Alert.alert(
      i18n.t("will_disconnect"),
      i18n.t("are_you_sure"),
      [
        {
          text: i18n.t("cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: i18n.t("logout"),
          onPress: async () => {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("activity");
            this.setState({ token: {} });
            this._register();
          },
        },
      ],
      { cancelable: false }
    );
  }
  async _Language() {
    Alert.alert(
      i18n.t("select_language"),
      i18n.t("select_language_list"),
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Español",
          onPress: async () => {
            await AsyncStorage.setItem("locale", "es");
            i18n.locale = "es";
            let action = StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: "Home",
                }),
              ],
              key: null,
            });
            this.props.navigation.dispatch(action);
          },
        },
        {
          text: "Català",
          onPress: async () => {
            await AsyncStorage.setItem("locale", "ca");
            i18n.locale = "ca";
            let action = StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: "Home",
                }),
              ],
              key: null,
            });
            this.props.navigation.dispatch(action);
          },
        },
      ],
      { cancelable: false }
    );
  }
  async _onClickNavigate(distance: string) {
    try {
      if (distance == "finisher") {
        let action = StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: "Finisher",
              params: {
                token: this.state.token,
                distance: "5",
              },
            }),
          ],
          key: null,
        });
        this.props.navigation.dispatch(action);
        return false;
      }
      // We check if the race is Open

      // const response = await axios.post(
      //   ENV.HOST + "/api/isOpen",
      //   {
      //     locale: i18n.locale,
      //   },
      //   {
      //     headers: {
      //       Accept: "application/json",
      //       Authorization: `Bearer ${this.state.token.access_token}`,
      //     },
      //   }
      // );
      const response = {
        data: true
      }
      if (response.data) {
        await AsyncStorage.setItem("initialRouteName", "Home");
        let action = StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: "SimpleMap",
              params: {
                token: this.state.token,
                distance: distance,
              },
            }),
          ],
          key: null,
        });
        this.props.navigation.dispatch(action);
      }
    } catch (error) {
      await Alert.alert(
        `${error.response.data.message}`,
        `${error.response.data.subtitle}`
      );

      if (error.response.data.code === "expired") {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("activity");
        let action = StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: "Home",
            }),
          ],
          key: null,
        });
        this.props.navigation.dispatch(action);
      }
    }
  }
  _register() {
    this.props.navigation.navigate("Registration", {
      response: (result: any) => {
        if (result == null) return;
        this.setState({
          token: result.token,
          email: result.email,
          inscription_id: result.inscription_id,
          deviceIdentifier: this.state.deviceModel + "-" + result.email,
        });
      },
    });
  }
  render() {
    if (this.state.fontLoaded) {
      return (
        <View style={styles.container}>
          <ImageBackground
            style={styles.image}
          >
            <SimpleLineIcons
              onPress={() => this._Logout()}
              style={styles.logout}
              name="logout"
              size={24}
              color="white"
            />
            <Fontisto
              onPress={() => this._Language()}
              style={styles.language}
              name="world-o"
              size={24}
              color="white"
            />
          
            <Body style={styles.body}>
              <Image
                style={styles.logo}
                source={require("../assets/adaptive-icon.png")}
              />
              <H1 style={styles.title}>{i18n.t("select_distance")}</H1>
              <Button
                full
                style={styles.button}
                onPress={() => this._onClickNavigate("2")}
              >
                <Text style={styles.button_text}>2Km</Text>
              </Button>
              <Button
                full
                style={styles.button}
                onPress={() => this._onClickNavigate("5")}
              >
                <Text style={styles.button_text}>5Km</Text>
              </Button>
              <Button
                full
                style={styles.button}
                onPress={() => this._onClickNavigate("10")}
              >
                <Text style={styles.button_text}>10Km</Text>
              </Button>
              <Text style={{ marginTop: 5, color: "#333", fontSize: 11 }}>
                v {Constants.manifest.version}
              </Text>
            </Body>
          </ImageBackground>
        </View>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#3730A3",
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  logout: {
    width: 56,
    height: 56,
    position: "absolute",
    left: 20,
    top: 70,
    zIndex: 200,
  },
  language: {
    width: 56,
    height: 56,
    position: "absolute",
    left: 60,
    top: 70,
    zIndex: 200,
  },
  logo: {
    width: 142,
    height: 125,
    marginBottom: 50,
  },
  body: {
    justifyContent: "center",
    padding: 40,
  },
  title: {
    textTransform: "uppercase",
    fontFamily: "montserratMedium",
    fontSize: 14,
    lineHeight: 24,
    color: "#F3F4F6",
    textAlign: "center",
    width: "100%",
    marginBottom: 20,
  },
  button: {
    marginBottom: 10,
    borderRadius: 6,
    backgroundColor: "#4F46E5",
    borderStyle: "solid",
    borderColor: "#4F46E5",
    borderWidth: 1,
    padding: 30,
    height: 100,
    width: Dimensions.get("window").width * 0.8,
    textAlign: "center",
  },
  button_text: {
    fontFamily: "Druk Wide Medium",
    fontSize: 48,
    color: "#F3F4F6",
    textAlign: "center",
  },
});
