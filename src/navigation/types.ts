import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: { email?: string } | undefined;
};

export type TabParamList = {
  Home: undefined;
  Discussions: undefined;
  NewSpaceTab: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  Chat: { spaceId: string; title?: string };
  SpaceDetails: { spaceId: string };
  NewSpace: undefined;
  JoinSpace: { spaceId?: string; code?: string } | undefined;
  Search: { query?: string } | undefined;
  Notifications: undefined;
  EditProfile: undefined;
  UserProfile: { userId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppStackParamList, AuthStackParamList {}
  }
}
