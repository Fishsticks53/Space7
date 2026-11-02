import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { Space } from '../api';
import { border, colors, hardShadow } from '../theme';
import { Text } from './Text';

interface Props {
  space: Space;
  color: string;
  onPress: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export function SpaceCard({ space, color, onPress, style, compact }: Props) {
  const tags = space.tags ?? [];
  const isPrivate = space.visibility === 'private';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open space ${space.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: color },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text variant="title" numberOfLines={compact ? 1 : 2}>
        {space.title}
      </Text>
      <Text numberOfLines={compact ? 3 : 4}>{space.description}</Text>
      <View style={styles.row}>
        <Ionicons name="person-circle-outline" size={20} color={colors.ink} />
        <Text variant="label" style={styles.creator} numberOfLines={1}>
          @{space.creator?.username ?? 'unknown'}
        </Text>
        <Ionicons name="people-outline" size={18} color={colors.ink} />
        <Text variant="label">{space.participant_count}</Text>
      </View>
      <View style={styles.tags}>
        <View style={styles.tag}>
          <Ionicons
            name={isPrivate ? 'lock-closed-outline' : 'globe-outline'}
            size={13}
            color={colors.ink}
          />
          <Text variant="caption" style={styles.tagText}>
            {space.visibility}
          </Text>
        </View>
        {space.is_locked ? (
          <View style={styles.tag}>
            <Text variant="caption" style={styles.tagText}>
              locked
            </Text>
          </View>
        ) : null}
        {tags.slice(0, compact ? 2 : 5).map(tag => (
          <View key={tag.tag_id} style={styles.tag}>
            <Text variant="caption" style={styles.tagText} numberOfLines={1}>
              #{tag.tag_name}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { ...border, ...hardShadow, borderRadius: 20, padding: 14, gap: 8 },
  pressed: { opacity: 0.85 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  creator: { flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    ...border,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: { color: colors.ink },
});
