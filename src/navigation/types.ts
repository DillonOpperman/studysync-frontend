import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { StackScreenProps } from '@react-navigation/stack';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeDeskParamList = {
  Desk: undefined;
  Groups: undefined;
  Friends: undefined;
  CreateGroup: undefined;
  Search: undefined;
  GroupDetail: { groupId: string };
  Notifications: undefined;
};

export type AppStackParamList = {
  Home: NavigatorScreenParams<HomeDeskParamList> | undefined;
  GroupChat: { groupId: string; title: string };
  DirectChat: { userId: string; name: string };
};

export type HomeDeskScreenProps<Route extends keyof HomeDeskParamList> =
  CompositeScreenProps<
    StackScreenProps<HomeDeskParamList, Route>,
    NativeStackScreenProps<AppStackParamList>
  >;

export const HOME_DESK_ROUTES: Array<keyof HomeDeskParamList> = [
  'Desk',
  'Groups',
  'Friends',
  'CreateGroup',
  'Search',
  'GroupDetail',
  'Notifications',
];

export const APP_STACK_ROUTES: Array<keyof AppStackParamList> = [
  'Home',
  'GroupChat',
  'DirectChat',
];
