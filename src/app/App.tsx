import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import { AuthProvider } from '../auth/AuthProvider';
import { NotificationsProvider } from '../features/notifications/NotificationsProvider';
import { PushProvider } from '../features/push/PushProvider';
import { RootNavigator } from '../navigation/RootNavigator';
import { ThemeProvider } from '../theme';

enableScreens();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar barStyle="dark-content" />
          <AuthProvider>
            <NotificationsProvider>
              <PushProvider>
                <RootNavigator />
              </PushProvider>
            </NotificationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
