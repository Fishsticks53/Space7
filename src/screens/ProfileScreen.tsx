import React from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import * as api from '../api';
import { useAuth } from '../auth/AuthContext';
import { Avatar } from '../components/Avatar';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { SpaceCard } from '../components/SpaceCard';
import { ErrorState, Loading } from '../components/StateViews';
import { Text } from '../components/Text';
import { useAsync } from '../hooks/useAsync';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { border, cardColors, colors, hardShadow } from '../theme';

export function StatTile({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={[styles.stat, { backgroundColor: color }]}>
      <Text variant="heading">{value}</Text>
      <Text variant="label">{label}</Text>
    </View>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const data = useAsync(
    () => Promise.all([api.getMyProfile(), api.mySpaces()]),
    [],
  );
  useRefreshOnFocus(data.refresh);

  const confirmSignOut = () =>
    Alert.alert('Sign out', 'Do you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);

  if (data.loading) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }
  if (data.error || !data.data) {
    return (
      <Screen>
        <ErrorState
          error={data.error ?? new Error('Could not load profile')}
          onRetry={data.refresh}
        />
      </Screen>
    );
  }

  const [profile, spaces] = data.data;
  const created = spaces.filter(s => s.role === 'creator');

  return (
    <Screen>
      <Header
        title={`@${profile.username}`}
        color={colors.yellow}
        back={false}
        right={
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="create-outline" size={26} color={colors.ink} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              onPress={confirmSignOut}
            >
              <Ionicons name="log-out-outline" size={26} color={colors.ink} />
            </Pressable>
          </View>
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={data.refreshing}
            onRefresh={data.refresh}
          />
        }
      >
        <View style={styles.identity}>
          <Avatar
            uri={profile.profile_picture}
            name={profile.username}
            size={96}
          />
          <Text variant="title">@{profile.username}</Text>
          <Text style={styles.bio}>
            {profile.bio || 'No bio yet. Tap the pencil to add one.'}
          </Text>
        </View>
        <View style={styles.stats}>
          <StatTile
            value={profile.stats.spaces_created}
            label="Created"
            color={colors.pink}
          />
          <StatTile
            value={profile.stats.spaces_participated}
            label="Joined"
            color={colors.blue}
          />
        </View>
        <View style={styles.stats}>
          <StatTile
            value={profile.stats.total_words_contributed}
            label="Words"
            color={colors.green}
          />
          <StatTile
            value={profile.stats.total_appreciations_received}
            label="Appreciations"
            color={colors.sky}
          />
        </View>
        <Text variant="title">Created spaces</Text>
        {created.length === 0 ? (
          <Text>You have not created any spaces yet.</Text>
        ) : null}
        {created.map((space, index) => (
          <SpaceCard
            key={space.space_id}
            space={space}
            color={cardColors[index % cardColors.length]}
            onPress={() =>
              navigation.navigate('Chat', { spaceId: space.space_id })
            }
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 16 },
  content: { padding: 16, gap: 16 },
  identity: { alignItems: 'center', gap: 6 },
  bio: { textAlign: 'center' },
  stats: { flexDirection: 'row', gap: 12 },
  stat: {
    ...border,
    ...hardShadow,
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
});
