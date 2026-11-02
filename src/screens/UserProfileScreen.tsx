import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as api from '../api';
import { Avatar } from '../components/Avatar';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { ErrorState, Loading } from '../components/StateViews';
import { Text } from '../components/Text';
import { useAsync } from '../hooks/useAsync';
import type { AppStackParamList } from '../navigation/types';
import { border, cardColors, colors } from '../theme';
import { StatTile } from './ProfileScreen';

type Props = NativeStackScreenProps<AppStackParamList, 'UserProfile'>;

export function UserProfileScreen({ navigation, route }: Props) {
  const profile = useAsync(
    () => api.getUserProfile(route.params.userId),
    [route.params.userId],
  );

  return (
    <Screen>
      <Header
        title={profile.data ? `@${profile.data.username}` : 'Profile'}
        color={colors.sky}
      />
      {profile.loading ? (
        <Loading />
      ) : profile.error || !profile.data ? (
        <ErrorState
          error={profile.error ?? new Error('User not found')}
          onRetry={profile.refresh}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.identity}>
            <Avatar
              uri={profile.data.profile_picture}
              name={profile.data.username}
              size={96}
            />
            <Text variant="title">@{profile.data.username}</Text>
            {profile.data.bio ? (
              <Text style={styles.center}>{profile.data.bio}</Text>
            ) : null}
          </View>
          <View style={styles.stats}>
            <StatTile
              value={profile.data.stats.spaces_created}
              label="Created"
              color={colors.pink}
            />
            <StatTile
              value={profile.data.stats.total_appreciations_received}
              label="Appreciations"
              color={colors.green}
            />
          </View>
          <Text variant="title">Public spaces</Text>
          {profile.data.publicSpaces.length === 0 ? (
            <Text>No public spaces yet.</Text>
          ) : null}
          {profile.data.publicSpaces.map((s, i) => (
            <Pressable
              key={s.space_id}
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate('Chat', {
                  spaceId: s.space_id,
                  title: s.title,
                })
              }
              style={[
                styles.space,
                { backgroundColor: cardColors[i % cardColors.length] },
              ]}
            >
              <Text variant="label">{s.title}</Text>
              <Text numberOfLines={2}>{s.description}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  identity: { alignItems: 'center', gap: 6 },
  center: { textAlign: 'center' },
  stats: { flexDirection: 'row', gap: 12 },
  space: { ...border, borderRadius: 16, padding: 12, gap: 4 },
});
