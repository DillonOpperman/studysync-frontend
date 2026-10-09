export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Groups: undefined;
  Search: undefined;
  CreateGroup: undefined;
  GroupDetail: { groupId: string };
  GroupChat: { groupId: string; title: string };
  Friends: undefined;
  DirectChat: { userId: string; name: string };
};

export const APP_STACK_ROUTES: Array<keyof AppStackParamList> = [
  'Home',
  'Groups',
  'Search',
  'CreateGroup',
  'GroupDetail',
  'GroupChat',
  'Friends',
  'DirectChat',
];
