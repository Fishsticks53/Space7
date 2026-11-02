import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as api from '../api';
import type { Visibility } from '../api';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { SpaceCard } from '../components/SpaceCard';
import { ErrorState, Loading } from '../components/StateViews';
import { Text } from '../components/Text';
import { useAsync } from '../hooks/useAsync';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { border, cardColors, colors } from '../theme';

const filters: { label: string; value?: Visibility }[] = [
  { label: 'All' },
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
];

export function DiscussionsScreen() {
  const navigation = useNavigation();
  const [visibility, setVisibility] = useState<Visibility | undefined>();
  const spaces = useAsync(() => api.mySpaces(visibility), [visibility]);
  useRefreshOnFocus(spaces.refresh);

  return (
    <Screen edges={['top']}>
      <Header
        title="My discussions"
        color={colors.pink}
        back={false}
        right={
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('JoinSpace')}
          >
            <Text variant="label" style={styles.joinLink}>
              Join with code
            </Text>
          </Pressable>
        }
      />
      <View style={styles.filters}>
        {filters.map(f => {
          const active = f.value === visibility;
          return (
            <Pressable
              key={f.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setVisibility(f.value)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text variant="label">{f.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {spaces.loading ? (
        <Loading />
      ) : spaces.error ? (
        <ErrorState error={spaces.error} onRetry={spaces.refresh} />
      ) : (
        <FlatList
          data={spaces.data}
          keyExtractor={s => s.space_id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={spaces.refreshing}
              onRefresh={spaces.refresh}
            />
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
          ListEmptyComponent={
            <View style={styles.empty}>
              <Image
                source={require('../../assets/Discussion.png')}
                style={styles.image}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
              <Text variant="label">You have not joined any spaces yet.</Text>
              <Button
                title="Start a space"
                onPress={() => navigation.navigate('NewSpace')}
              />
            </View>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  joinLink: { textDecorationLine: 'underline' },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  chip: {
    ...border,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.yellow },
  list: { padding: 16, gap: 16, flexGrow: 1 },
  empty: { alignItems: 'center', gap: 16, paddingTop: 24 },
  image: { width: '100%', height: 260 },
});
