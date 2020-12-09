import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import HomeView from './HomeView';
import RegistrationView from './RegistrationView';

const HomeApp = createStackNavigator({
  Home: {
    screen: HomeView
  },
  Registration: {
    screen: RegistrationView
  }
}, {
  initialRouteName: 'Home',
  headerMode: 'none',
  mode: 'modal'
});

export default createAppContainer(HomeApp);
