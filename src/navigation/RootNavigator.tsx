import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';

import { useAuth } from '../auth/AuthProvider';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { lightColors } from '../theme';
import { rootFor } from './rootFor';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
};

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

const stackOptions = {
  headerShown: false,
  animation: 'fade' as const,
  animationDuration: 200,
  contentStyle: { backgroundColor: lightColors.canvas },
};

function SignedOutNavigator() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  return (
    <AuthStack.Navigator screenOptions={stackOptions}>
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
    <AppStack.Navigator screenOptions={stackOptions}>
      <AppStack.Screen name="Home" component={HomeScreen} />
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
    <NavigationContainer theme={navigationTheme}>
      {root === 'app' ? <SignedInNavigator /> : <SignedOutNavigator />}
    </NavigationContainer>
  );
}
