import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import * as api from '../api';
import type { SpaceMember } from '../api';
import { useAuth } from '../auth/AuthContext';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { ErrorState, Loading } from '../components/StateViews';
import { Text } from '../components/Text';
import { useAsync } from '../hooks/useAsync';
import type { AppStackParamList } from '../navigation/types';
import { border, colors } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'SpaceDetails'>;

export function inviteLink(spaceId: string, code: string) {
  return `space7://join/${spaceId}/${code}`;
}

export function SpaceDetailsScreen({ navigation, route }: Props) {
  const { spaceId } = route.params;
  const { user } = useAuth();
  const space = useAsync(() => api.getSpace(spaceId), [spaceId]);
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, action: () => Promise<unknown>) => {
    setBusy(key);
    try {
      await action();
      space.refresh();
    } catch (e) {
      Alert.alert('Something went wrong', (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const shareInvite = () =>
    run('invite', async () => {
      const { code, expires_at } = await api.createInviteCode(spaceId);
      const expires = new Date(expires_at).toLocaleString();
      await Share.share({
        message: `Join "${space.data?.title}" on space7: ${inviteLink(
          spaceId,
          code,
        )}\nInvite code: ${code} (single use, expires ${expires})`,
      });
    });

  const confirmArchive = () =>
    Alert.alert(
      'Archive space',
      'Archived spaces become read only. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => run('archive', () => api.archiveSpace(spaceId)),
        },
      ],
    );

  const confirmRemove = (member: SpaceMember) =>
    Alert.alert(
      'Remove member',
      `Remove @${member.user.username} from this space?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            run(`remove-${member.user_id}`, () =>
              api.removeMember(spaceId, member.user_id),
            ),
        },
      ],
    );

  if (space.loading) {
    return (
      <Screen>
        <Header title="Space details" color={colors.sky} />
        <Loading />
      </Screen>
    );
  }
  if (space.error || !space.data) {
    return (
      <Screen>
        <Header title="Space details" color={colors.sky} />
        <ErrorState
          error={space.error ?? new Error('Space not found')}
          onRetry={space.refresh}
        />
      </Screen>
    );
  }

  const s = space.data;
  const isCreator = s.members.some(
    m => m.user_id === user?.user_id && m.role === 'creator',
  );

  return (
    <Screen>
      <Header title="Space details" color={colors.sky} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={space.refreshing}
            onRefresh={space.refresh}
          />
        }
      >
        <Text variant="heading">{s.title}</Text>
        <Text>{s.description}</Text>
        <View style={styles.badges}>
          <Badge
            icon={
              s.visibility === 'private'
                ? 'lock-closed-outline'
                : 'globe-outline'
            }
            label={s.visibility}
          />
          {s.is_locked ? (
            <Badge icon="pause-circle-outline" label="locked" />
          ) : null}
          {s.is_archived ? (
            <Badge icon="archive-outline" label="archived" />
          ) : null}
          {(s.tags ?? []).map(t => (
            <Badge
              key={t.tag_id}
              label={`#${t.tag_name}`}
              onPress={() =>
                navigation.navigate('Search', { query: `#${t.tag_name}` })
              }
            />
          ))}
        </View>
        <Text variant="caption">
          Created {new Date(s.created_at).toLocaleDateString()} ·{' '}
          {s.message_count} messages · {s.participant_count} members
        </Text>

        {isCreator && !s.is_archived ? (
          <View style={styles.actions}>
            <Text variant="title">Manage</Text>
            {s.visibility === 'private' ? (
              <Button
                title="Share an invite code"
                onPress={shareInvite}
                loading={busy === 'invite'}
              />
            ) : null}
            <Button
              title={s.is_locked ? 'Unlock space' : 'Lock space'}
              color={colors.green}
              onPress={() => run('lock', () => api.toggleLock(spaceId))}
              loading={busy === 'lock'}
            />
            <Button
              title="Archive space"
              color={colors.danger}
              onPress={confirmArchive}
              loading={busy === 'archive'}
            />
          </View>
        ) : null}

        <Text variant="title">Members</Text>
        {s.members.map(m => (
          <View key={m.id} style={styles.member}>
            <Pressable
              accessibilityRole="button"
              style={styles.memberInfo}
              onPress={() =>
                navigation.navigate('UserProfile', { userId: m.user_id })
              }
            >
              <Avatar
                uri={m.user.profile_picture}
                name={m.user.username}
                size={36}
              />
              <Text variant="label" style={styles.flex} numberOfLines={1}>
                @{m.user.username}
              </Text>
              {m.role === 'creator' ? (
                <Text variant="caption">creator</Text>
              ) : null}
            </Pressable>
            {isCreator && m.role !== 'creator' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove @${m.user.username}`}
                hitSlop={8}
                disabled={busy !== null}
                onPress={() => confirmRemove(m)}
              >
                <Ionicons
                  name="person-remove-outline"
                  size={22}
                  color={colors.danger}
                />
              </Pressable>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

function Badge({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={styles.badge}
    >
      {icon ? <Ionicons name={icon} size={14} color={colors.ink} /> : null}
      <Text variant="caption" style={styles.badgeText}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 12 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: {
    ...border,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
  },
  badgeText: { color: colors.ink },
  actions: { gap: 10 },
  member: {
    ...border,
    borderWidth: 2,
    borderRadius: 14,
    backgroundColor: colors.surface,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
});
