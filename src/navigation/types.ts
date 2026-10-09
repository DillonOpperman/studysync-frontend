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
  Home: undefined;
  Groups: undefined;
};

export type AppStackParamList = {
  Home: NavigatorScreenParams<HomeDeskParamList> | undefined;
  Search: undefined;
  CreateGroup: undefined;
  GroupDetail: { groupId: string };
  GroupChat: { groupId: string; title: string };
  Friends: undefined;
  DirectChat: { userId: string; name: string };
};

export type HomeDeskScreenProps<Route extends keyof HomeDeskParamList> =
  CompositeScreenProps<
    StackScreenProps<HomeDeskParamList, Route>,
    NativeStackScreenProps<AppStackParamList>
  >;

export const HOME_DESK_ROUTES: Array<keyof HomeDeskParamList> = [
  'Home',
  'Groups',
];

export const APP_STACK_ROUTES: Array<keyof AppStackParamList> = [
  'Home',
  'Search',
  'CreateGroup',
  'GroupDetail',
  'GroupChat',
  'Friends',
  'DirectChat',
];
