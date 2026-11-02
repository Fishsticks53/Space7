import React from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import * as api from '../api';
import type { AppNotification, NotificationType } from '../api';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { EmptyState, ErrorState, Loading } from '../components/StateViews';
import { Text } from '../components/Text';
import { formatTime } from '../chat/MessageBubble';
import { useAsync } from '../hooks/useAsync';
import type { AppStackParamList } from '../navigation/types';
import { border, colors } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Notifications'>;

const icons: Record<
  NotificationType,
  React.ComponentProps<typeof Ionicons>['name']
> = {
  new_message: 'chatbubble-ellipses-outline',
  appreciation_received: 'heart-outline',
  invite_used: 'person-add-outline',
  space_locked: 'pause-circle-outline',
  space_archived: 'archive-outline',
};

// For these types reference_id is a space id, so the notification can open it.
// For message types it is a message id, which the API cannot resolve to a space.
const opensSpace: NotificationType[] = [
  'invite_used',
  'space_locked',
  'space_archived',
];

export function NotificationsScreen({ navigation }: Props) {
  const list = useAsync(() => api.getNotifications(1), []);

  const markRead = (id: string) =>
    list.setData(
      d =>
        d && {
          ...d,
          unreadCount: Math.max(0, d.unreadCount - 1),
          notifications: d.notifications.map(n =>
            n.notification_id === id ? { ...n, is_read: true } : n,
          ),
        },
    );

  const open = (n: AppNotification) => {
    if (!n.is_read) {
      markRead(n.notification_id);
      api.markNotificationRead(n.notification_id).catch(() => {});
    }
    if (n.reference_id && opensSpace.includes(n.type))
      navigation.navigate('Chat', { spaceId: n.reference_id });
  };

  const readAll = async () => {
    try {
      await api.markAllNotificationsRead();
      list.refresh();
    } catch (e) {
      Alert.alert('Could not update', (e as Error).message);
    }
  };

  return (
    <Screen>
      <Header
        title="Notifications"
        color={colors.yellow}
        right={
          list.data?.unreadCount ? (
            <Pressable accessibilityRole="button" onPress={readAll}>
              <Text variant="label" style={styles.link}>
                Mark all read
              </Text>
            </Pressable>
          ) : undefined
        }
      />
      {list.loading ? (
        <Loading />
      ) : list.error ? (
        <ErrorState error={list.error} onRetry={list.refresh} />
      ) : (
        <FlatList
          data={list.data?.notifications}
          keyExtractor={n => n.notification_id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={list.refreshing}
              onRefresh={list.refresh}
            />
          }
          ListEmptyComponent={<EmptyState message="You're all caught up." />}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: !item.is_read }}
              onPress={() => open(item)}
              style={[styles.item, !item.is_read && styles.unread]}
            >
              <Ionicons name={icons[item.type]} size={24} color={colors.ink} />
              <View style={styles.flex}>
                <Text variant={item.is_read ? 'body' : 'label'}>
                  {item.message}
                </Text>
                <Text variant="caption">{formatTime(item.created_at)}</Text>
              </View>
              {!item.is_read ? <View style={styles.dot} /> : null}
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  link: { textDecorationLine: 'underline' },
  list: { padding: 16, gap: 10, flexGrow: 1 },
  item: {
    ...border,
    borderWidth: 2,
    borderRadius: 14,
    backgroundColor: colors.surface,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unread: { backgroundColor: colors.sky },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.pink },
});
