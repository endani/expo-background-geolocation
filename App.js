import React, { useEffect } from 'react';
import { createAppContainer } from 'react-navigation';
import { Text, View, StyleSheet, BackHandler, Alert } from 'react-native';
import Navigator from './Navigator';

const AppContainer = createAppContainer(Navigator);
console.disableYellowBox = true; // disable warnings

export default function App() {
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Warning! This action will close the app. ',
        'Are you sure ?',
        [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          { text: 'Exit', onPress: () => BackHandler.exitApp() },
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return <AppContainer />;
}
