import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import * as api from '../api';
import { Avatar } from '../components/Avatar';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { SpaceCard } from '../components/SpaceCard';
import { EmptyState, ErrorState, Loading } from '../components/StateViews';
import { Text } from '../components/Text';
import { useAsync } from '../hooks/useAsync';
import type { AppStackParamList } from '../navigation/types';
import { border, cardColors, colors, fonts } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Search'>;
type Tab = 'spaces' | 'users';

export function SearchScreen({ navigation, route }: Props) {
  const [input, setInput] = useState(route.params?.query ?? '');
  const [query, setQuery] = useState(route.params?.query ?? '');
  const [tab, setTab] = useState<Tab>('spaces');
  const isTag = query.startsWith('#');

  const results = useAsync(async () => {
    if (!query) return { spaces: [], users: [] };
    const [spaces, users] = await Promise.all([
      isTag ? api.spacesByTag(query) : api.searchSpaces(query),
      isTag ? Promise.resolve([]) : api.searchUsers(query),
    ]);
    return { spaces, users };
  }, [query, isTag]);

  return (
    <Screen>
      <Header title="Search" color={colors.blue} />
      <View style={styles.bar}>
        <Ionicons name="search" size={20} color={colors.ink} />
        <TextInput
          autoFocus={!route.params?.query}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => setQuery(input.trim())}
          returnKeyType="search"
          autoCapitalize="none"
          placeholder="Search spaces, #tags or users"
          placeholderTextColor={colors.muted}
          style={styles.input}
          accessibilityLabel="Search"
        />
      </View>
      {!isTag ? (
        <View style={styles.tabs}>
          {(['spaces', 'users'] as const).map(t => (
            <Pressable
              key={t}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === t }}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text variant="label">
                {t === 'spaces' ? 'Spaces' : 'Users'}
                {results.data ? ` (${results.data[t].length})` : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {!query ? (
        <EmptyState message="Search by title, description, #hashtag or username." />
      ) : results.loading ? (
        <Loading />
      ) : results.error ? (
        <ErrorState error={results.error} onRetry={results.refresh} />
      ) : tab === 'users' && !isTag ? (
        <FlatList
          data={results.data?.users}
          keyExtractor={u => u.user_id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState message={`No users match "${query}".`} />
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              style={styles.user}
              onPress={() =>
                navigation.navigate('UserProfile', { userId: item.user_id })
              }
            >
              <Avatar uri={item.profile_picture} name={item.username} />
              <View style={styles.flex}>
                <Text variant="label">@{item.username}</Text>
                {item.bio ? (
                  <Text variant="caption" numberOfLines={1}>
                    {item.bio}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          data={results.data?.spaces}
          keyExtractor={s => s.space_id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState message={`No spaces match "${query}".`} />
          }
          renderItem={({ item, index }) => (
            <SpaceCard
              space={item}
              color={cardColors[index % cardColors.length]}
              onPress={() =>
                navigation.navigate('Chat', { spaceId: item.space_id })
              }
            />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: {
    ...border,
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.ink,
  },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  tab: {
    ...border,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: colors.surface,
  },
  tabActive: { backgroundColor: colors.yellow },
  list: { padding: 16, gap: 12, flexGrow: 1 },
  user: {
    ...border,
    borderWidth: 2,
    borderRadius: 14,
    backgroundColor: colors.surface,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
