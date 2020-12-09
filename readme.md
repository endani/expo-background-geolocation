# Expo Background Geolocation
Boilerplate for a background geolocation using Expo and it's [Background Location Method](https://docs.expo.io/versions/v39.0.0/sdk/location/#background-location-methods).

Made by Dani Ramírez on Dec 2020. 

### Stack

This project uses:
- [Expo](https://expo.io/) 
- [Formik](https://formik.org/)
- [React Native](https://reactnative.dev/) 

### Requirements
To deploy this code you need node installed 
You can check if you have it installed by running: 
```bash
npm -v
```
It must return something like `6.14.8`

Also, you will need [Explo Cli](https://docs.expo.io/) installed.

## Installation
Download the repository and install it with npm 
```bash
git clone https://github.com/endani/expo-background-geolocation.git my-project
cd my-project
npm install
```

Remember that `npm install` could take a while. It is completely normal, because that installs all the dependencies.

That's it! From now on, you can execute this command to run your compiled add.

```bash
expo start
```

### Usage
This app is not connected to any backend and all the information is stored locally.
You can login with some random user/password.

### Android background service issues
There are repeatedly reported issues with some android devices not working in the background. Check if your device model is on [dontkillmyapp](https://dontkillmyapp.com/) list before you report new issue. For more information check out [dontkillmyapp.com](https://dontkillmyapp.com/problem).
