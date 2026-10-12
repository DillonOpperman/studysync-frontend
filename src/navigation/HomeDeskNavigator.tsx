import { createStackNavigator } from '@react-navigation/stack';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Wallpaper } from '../components/Wallpaper';
import { CreateGroupScreen } from '../screens/CreateGroupScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { useReduceMotion } from '../theme';
import { deskStackOptions } from './glassPageTurn';
import type { HomeDeskParamList } from './types';

const Desk = createStackNavigator<HomeDeskParamList>();

export function HomeDeskNavigator() {
  const reduceMotion = useReduceMotion();
  const options = useMemo(() => deskStackOptions(reduceMotion), [reduceMotion]);

  return (
    <View style={styles.fill}>
      <Wallpaper mood="home" />
      <Desk.Navigator detachInactiveScreens={false} screenOptions={options}>
        <Desk.Screen name="Desk" component={HomeScreen} />
        <Desk.Screen name="Groups" component={GroupsScreen} />
        <Desk.Screen name="Friends" component={FriendsScreen} />
        <Desk.Screen name="CreateGroup" component={CreateGroupScreen} />
        <Desk.Screen name="Search" component={SearchScreen} />
        <Desk.Screen name="GroupDetail" component={GroupDetailScreen} />
        <Desk.Screen name="Notifications" component={NotificationsScreen} />
      </Desk.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#F7F0E3' },
});
