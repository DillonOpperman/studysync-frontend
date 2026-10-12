import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';

import { useAuth } from '../auth/AuthProvider';
import { appNavigationRef } from './ref';
import { DirectChatScreen } from '../screens/DirectChatScreen';
import { GroupChatScreen } from '../screens/GroupChatScreen';
import { HomeDeskNavigator } from './HomeDeskNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { lightColors } from '../theme';
import { rootFor } from './rootFor';
import type { AppStackParamList, AuthStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: lightColors.canvas,
    card: lightColors.canvas,
    text: lightColors.text,
    border: lightColors.border,
    primary: lightColors.accent,
  },
};

const authOptions = {
  headerShown: false,
  animation: 'fade' as const,
  animationDuration: 200,
  contentStyle: { backgroundColor: lightColors.canvas },
};

const appOptions = {
  headerShown: false,
  animation: 'slide_from_right' as const,
  animationDuration: 220,
  contentStyle: { backgroundColor: lightColors.canvas },
};

function SignedOutNavigator() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  return (
    <AuthStack.Navigator screenOptions={authOptions}>
      {mode === 'login' ? (
        <AuthStack.Screen name="Login">
          {() => <LoginScreen onGoRegister={() => setMode('register')} />}
        </AuthStack.Screen>
      ) : (
        <AuthStack.Screen name="Register">
          {() => <RegisterScreen onGoLogin={() => setMode('login')} />}
        </AuthStack.Screen>
      )}
    </AuthStack.Navigator>
  );
}

function SignedInNavigator() {
  return (
    <AppStack.Navigator screenOptions={appOptions}>
      <AppStack.Screen name="Home" component={HomeDeskNavigator} />
      <AppStack.Screen name="GroupChat" component={GroupChatScreen} />
      <AppStack.Screen name="DirectChat" component={DirectChatScreen} />
    </AppStack.Navigator>
  );
}

export function RootNavigator() {
  const { state } = useAuth();
  const root = rootFor(state);
  if (root === 'splash') {
    return <SplashScreen />;
  }
  return (
    <NavigationContainer ref={appNavigationRef} theme={navigationTheme}>
      {root === 'app' ? <SignedInNavigator /> : <SignedOutNavigator />}
    </NavigationContainer>
  );
}
