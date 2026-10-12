/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './src/app/App';
import { name as appName } from './app.json';

try {
  // FCM displays the OS notification. This handler only acknowledges the event.
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async () => {});
} catch {
  // Development builds without Firebase native modules.
}

AppRegistry.registerComponent(appName, () => App);
