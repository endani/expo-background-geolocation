import React from "react";
import { Image, Dimensions, Linking, Alert } from "react-native";
import * as Font from "expo-font";
import { Component } from "react";
import * as DeviceInfo from "expo-device";
import AsyncStorage from "@react-native-community/async-storage";
import { Root, Popup, Toast } from "popup-ui";
import axios from "axios";
import { EvilIcons, Fontisto } from "@expo/vector-icons";
import { Formik, useField, useFormikContext } from "formik";
import * as Yup from "yup";
import { StyleSheet } from "react-native";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { NavigationActions, StackActions } from "react-navigation";
import ENV from "../ENV";

import {
  Container,
  Button,
  Text,
  Content,
  Body,
  Card,
  CardItem,
  Input,
  Item as FormItem,
} from "native-base";
import * as Localization from "expo-localization";
import i18n from "i18n-js";

AsyncStorage.getItem("locale").then((res) => {
  i18n.locale = res || "es";
});
i18n.fallbacks = true;

type IProps = {
  navigation: any;
};

type IState = {
  token: Object;
  user: Object;
  email: string;
  inscription_id: string;
  device: string;
};

const FormularioItem = ({ fieldName, ...props }) => {
  const [field, meta] = useField(fieldName);
  return (
    <>
      <FormItem stackedLabel style={styles.formItem}>
        <Input
          onBlur={field.onBlur(fieldName)}
          value={field.value}
          onChangeText={field.onChange(fieldName)}
          style={styles.input}
          keyboardType="default"
          autoCapitalize="none"
          autoCompleteType="username"
          autoCorrect={false}
          autoFocus={false}
          {...props}
        />
      </FormItem>
      {meta.error && meta.touched && (
        <Text
          style={{
            color: "red",
            fontSize: 10,
            paddingTop: 4,
            textAlign: "center",
          }}
        >
          {meta.error}
        </Text>
      )}
    </>
  );
};
const Formulari = () => {
  const { submitForm } = useFormikContext();
  return (
    <>
      <FormularioItem fieldName="email" placeholder={i18n.t("email")} />
      <FormularioItem
        fieldName="password"
        placeholder={i18n.t("inscription_code")}
      />
      <Button full onPress={submitForm} style={styles.button}>
        <Text>{i18n.t("access_btn")}</Text>
      </Button>
    </>
  );
};

export default class RegistrationView extends Component<any, any> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      token: {},
      user: {},
      email: "",
      device: "",
      url: ENV.TRACKER_HOST,
      fontLoaded: false,
    };
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
  }
  onClickOpenWebsite() {
    let url = "https://cursavirtual.barcelona/";
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  }
  async onClickRegister(email, inscription_id) {
    try {
      // Replace with your Auth method

      // const response = await axios.post(ENV.HOST + "/api/login", {
      //   email: email,
      //   password: inscription_id,
      //   locale: i18n.locale,
      // });
      const response = {
        data: 'AUTH_TOKEN_HERE'
      }
      if (response.data) {
        await AsyncStorage.setItem("token", JSON.stringify(response.data));

        this.setState({
          token: response.data,
          email: email,
          inscription_id: inscription_id,
        });

        this.props.navigation.state.params.response({
          token: response.data,
          email: email,
          inscription_id: inscription_id,
        });
        this.props.navigation.goBack(); // we go back to the select distance view
        return true;
      }
    } catch (error) {
      Toast.show({
        type: "Danger",
        title: `${error.message}`,
        color: "#e74c3c",
        timing: 2000,
        icon: <EvilIcons name="close" size={25} color="white" />,
      });

      return false;
    }
  }
  async _Language() {
    console.log("aqui");
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
  render() {
    if (this.state.fontLoaded) {
      return (
        <Root>
          <Container style={styles.container}>
            <Fontisto
              onPress={() => this._Language()}
              style={styles.language}
              name="world-o"
              size={24}
              color="white"
            />
            <Image
              style={styles.logo}
              source={require("../assets/adaptive-icon.png")}
            />
            <Content style={styles.content}>
              <Card style={styles.card}>
                <CardItem header bordered style={styles.cardItem}>
                  <Body>
                    <Text style={styles.title}>{i18n.t("access")}</Text>
                    <Text style={styles.subtitle}>
                      {i18n.t("access_details")}
                    </Text>
                  </Body>
                </CardItem>
                <Formik
                  initialValues={{
                    email: "",
                    password: "",
                  }}
                  validationSchema={Yup.object({
                    email: Yup.string()
                      .email(i18n.t("wrong_format"))
                      .required(i18n.t("required_field")),
                    password: Yup.string()
                      .min(6, i18n.t("wrong_length"))
                      .max(7, i18n.t("wrong_length"))
                      .required(i18n.t("required_field")),
                  })}
                  onSubmit={async (values, { setSubmitting, resetForm }) => {
                    const response = await this.onClickRegister(
                      values.email,
                      values.password
                    );
                    if (response === true) {
                      resetForm();
                      setSubmitting(false);
                    }
                  }}
                >
                  <Formulari style={styles.form} />
                </Formik>
              </Card>
            </Content>
          </Container>
        </Root>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    backgroundColor: "#3730A3",
    width: "100%",
  },
  language: {
    width: 56,
    height: 56,
    position: "absolute",
    left: 20,
    top: 70,
    zIndex: 2000,
  },
  logo: {
    width: 142,
    height: 125,
    position: "absolute",
    right: Dimensions.get("window").width / 2 - 71,
    top: 150,
  },
  content: {
    textAlign: "center",
    width: "100%",
  },
  card: {
    backgroundColor: "#FFF",
    height: 450,
    marginTop: 300,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    paddingTop: 0,
    borderRadius: 40,
  },
  cardItem: {
    // borderTopLeftRadius: 40,
    // borderTopRightRadius: 40,
    borderRadius: 40,
  },
  title: {
    fontFamily: "Druk Wide Medium",
    fontSize: 32,
    lineHeight: 42,
    color: "#444444",
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
    marginTop: 50,
  },
  subtitle: {
    fontFamily: "montserratLight",
    fontSize: 14,
    lineHeight: 24,
    color: "#444444",
    textAlign: "center",
    width: "100%",
    marginTop: 10,
  },
  subtitle_link: {
    fontFamily: "montserratMedium",
    fontSize: 14,
    lineHeight: 24,
    color: "#FE840E",
    textAlign: "center",
    width: "100%",
    marginTop: 10,
  },
  form: {
    width: "100%",
    borderRadius: 40,
  },
  formItem: {
    minHeight: 50,
    marginLeft: 0,
    marginTop: 20,
    width: "100%",
    borderBottomColor: null,
    borderRadius: 40,
  },
  input: {
    fontFamily: "montserratLight",
    fontSize: 16,
    height: 40,
    backgroundColor: "#EEEEEE",
    borderRadius: 24,
    color: "#888888",
    letterSpacing: -0.2,
    lineHeight: 18,
    paddingLeft: 20,
  },
  button: {
    fontFamily: "montserratMedium",
    backgroundColor: "#444444",
    borderRadius: 28,
    fontSize: 1,
    color: "#FFFFFF",
    letterSpacing: 2.18,
    textAlign: "center",
    lineHeight: 24,
    marginTop: 50,
    textTransform: "uppercase",
  },
});
