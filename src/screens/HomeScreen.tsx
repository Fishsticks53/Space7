import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import * as api from '../api';
import { Logo } from '../components/Logo';
import { Screen } from '../components/Screen';
import { SpaceCard } from '../components/SpaceCard';
import { EmptyState, ErrorState, Loading } from '../components/StateViews';
import { Text } from '../components/Text';
import { useAsync } from '../hooks/useAsync';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { border, cardColors, colors, fonts, hardShadow } from '../theme';

export function HomeScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const feed = useAsync(
    () => Promise.all([api.trendingSpaces(10), api.recommendedSpaces(20)]),
    [],
  );
  const unread = useAsync(
    () => api.getNotifications(1).then(n => n.unreadCount),
    [],
  );
  useRefreshOnFocus(() => {
    unread.refresh();
    feed.refresh();
  });

  const openSpace = (spaceId: string) =>
    navigation.navigate('Chat', { spaceId });
  const search = () => {
    if (query.trim()) navigation.navigate('Search', { query: query.trim() });
  };

  const [trending = [], recommended = []] = feed.data ?? [];

  const header = (
    <View>
      <Text
        variant="title"
        style={[styles.pill, { backgroundColor: colors.pink }]}
      >
        Trending
      </Text>
      <FlatList
        horizontal
        data={trending}
        keyExtractor={s => s.space_id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hList}
        renderItem={({ item, index }) => (
          <SpaceCard
            compact
            space={item}
            color={cardColors[index % cardColors.length]}
            style={styles.trendingCard}
            onPress={() => openSpace(item.space_id)}
          />
        )}
        ListEmptyComponent={<Text>No trending spaces yet.</Text>}
      />
      <Text
        variant="title"
        style={[styles.pill, { backgroundColor: colors.green }]}
      >
        Recommended for you
      </Text>
    </View>
  );

  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.topRow}>
          <Logo />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Notifications${
              unread.data ? `, ${unread.data} unread` : ''
            }`}
            style={styles.bell}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons
              name="notifications-outline"
              size={28}
              color={colors.ink}
            />
            {unread.data ? (
              <View style={styles.badge}>
                <Text variant="caption" style={styles.badgeText}>
                  {unread.data > 99 ? '99+' : unread.data}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
        <View style={styles.search}>
          <Ionicons name="search" size={22} color={colors.ink} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            returnKeyType="search"
            placeholder="Search spaces, #tags or users"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            accessibilityLabel="Search"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search"
            onPress={search}
            hitSlop={8}
          >
            <Ionicons
              name="arrow-forward-circle"
              size={30}
              color={colors.ink}
            />
          </Pressable>
        </View>
      </View>
      {feed.loading ? (
        <Loading />
      ) : feed.error ? (
        <ErrorState error={feed.error} onRetry={feed.refresh} />
      ) : (
        <FlatList
          data={recommended}
          keyExtractor={s => s.space_id}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={feed.refreshing}
              onRefresh={feed.refresh}
            />
          }
          renderItem={({ item, index }) => (
            <SpaceCard
              space={item}
              color={cardColors[(index + 2) % cardColors.length]}
              onPress={() => openSpace(item.space_id)}
            />
          )}
          ListEmptyComponent={
            <EmptyState message="You have joined every public space. Start a new one!" />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    backgroundColor: colors.blue,
    padding: 16,
    gap: 12,
    borderBottomWidth: border.borderWidth,
    borderColor: colors.ink,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bell: {
    ...border,
    borderRadius: 14,
    padding: 6,
    backgroundColor: colors.yellow,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 22,
    paddingHorizontal: 4,
    borderRadius: 11,
    backgroundColor: colors.pink,
    ...border,
    borderWidth: 2,
    alignItems: 'center',
  },
  badgeText: { color: colors.ink, fontFamily: fonts.bold },
  search: {
    ...border,
    ...hardShadow,
    borderRadius: 18,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.ink,
    paddingVertical: 10,
  },
  list: { padding: 16, gap: 16 },
  pill: {
    ...border,
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  hList: { gap: 12, paddingVertical: 12, paddingRight: 8 },
  trendingCard: { width: 250 },
});
