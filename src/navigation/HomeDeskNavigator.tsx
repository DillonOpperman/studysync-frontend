import { createStackNavigator } from '@react-navigation/stack';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Wallpaper } from '../components/Wallpaper';
import { GroupsScreen } from '../screens/GroupsScreen';
import { HomeScreen } from '../screens/HomeScreen';
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
      </Desk.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#F7F0E3' },
});
