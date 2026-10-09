import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';

import { useAuth } from '../auth/AuthProvider';
import { CreateGroupScreen } from '../screens/CreateGroupScreen';
import { GroupChatScreen } from '../screens/GroupChatScreen';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SearchScreen } from '../screens/SearchScreen';
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
      <AppStack.Screen name="Home" component={HomeScreen} />
      <AppStack.Screen name="Groups" component={GroupsScreen} />
      <AppStack.Screen name="Search" component={SearchScreen} />
      <AppStack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <AppStack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <AppStack.Screen name="GroupChat" component={GroupChatScreen} />
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
