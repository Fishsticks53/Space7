import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useAuth } from '../auth/AuthContext';
import { Loading } from '../components/StateViews';
import { border, colors, fonts } from '../theme';
import type {
  AppStackParamList,
  AuthStackParamList,
  TabParamList,
} from './types';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { DiscussionsScreen } from '../screens/DiscussionsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { NewSpaceScreen } from '../screens/NewSpaceScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { SpaceDetailsScreen } from '../screens/SpaceDetailsScreen';
import { JoinSpaceScreen } from '../screens/JoinSpaceScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const tabIcons: Record<keyof TabParamList, IconName> = {
  Home: 'home',
  Discussions: 'chatbubbles',
  NewSpaceTab: 'add-circle',
  Profile: 'person',
};

const tabIcon =
  (name: keyof TabParamList) =>
  ({ color, size }: { color: string; size: number }) =>
    <Ionicons name={tabIcons[name]} size={size} color={color} />;

// Never rendered: pressing the tab opens the NewSpace screen instead.
const Empty = () => null;

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.semibold },
        tabBarStyle: {
          borderTopWidth: border.borderWidth,
          borderTopColor: colors.ink,
        },
        tabBarIcon: tabIcon(route.name),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discussions" component={DiscussionsScreen} />
      <Tab.Screen
        name="NewSpaceTab"
        component={Empty}
        options={{ title: 'New Space' }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.getParent()?.navigate('NewSpace');
          },
        })}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { status } = useAuth();
  if (status === 'loading') return <Loading />;

  if (status === 'signedOut') {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
        <AuthStack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
        />
      </AuthStack.Navigator>
    );
  }

  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Tabs" component={Tabs} />
      <AppStack.Screen name="Chat" component={ChatScreen} />
      <AppStack.Screen name="SpaceDetails" component={SpaceDetailsScreen} />
      <AppStack.Screen
        name="NewSpace"
        component={NewSpaceScreen}
        options={{ presentation: 'modal' }}
      />
      <AppStack.Screen
        name="JoinSpace"
        component={JoinSpaceScreen}
        options={{ presentation: 'modal' }}
      />
      <AppStack.Screen name="Search" component={SearchScreen} />
      <AppStack.Screen name="Notifications" component={NotificationsScreen} />
      <AppStack.Screen name="EditProfile" component={EditProfileScreen} />
      <AppStack.Screen name="UserProfile" component={UserProfileScreen} />
    </AppStack.Navigator>
  );
}
