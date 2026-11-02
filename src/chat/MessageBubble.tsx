import React from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { Message } from '../api';
import { Avatar } from '../components/Avatar';
import { Text } from '../components/Text';
import { border, colors } from '../theme';
import { appreciationCount } from './messages';

interface Props {
  message: Message;
  mine: boolean;
  appreciated: boolean;
  onAppreciate: () => void;
  onLongPress?: () => void;
  onOpenSender: () => void;
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function MessageBubble({
  message,
  mine,
  appreciated,
  onAppreciate,
  onLongPress,
  onOpenSender,
}: Props) {
  const name = message.sender?.username ?? 'user';
  const count = appreciationCount(message);
  return (
    <View style={[styles.row, mine && styles.rowMine]}>
      {!mine ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View @${name}`}
          onPress={onOpenSender}
        >
          <Avatar uri={message.sender?.profile_picture} name={name} size={34} />
        </Pressable>
      ) : null}
      <Pressable
        onLongPress={onLongPress}
        delayLongPress={350}
        accessibilityHint={onLongPress ? 'Long press for options' : undefined}
        style={[
          styles.bubble,
          { backgroundColor: mine ? colors.yellow : colors.surface },
        ]}
      >
        {!mine ? (
          <Text variant="label" onPress={onOpenSender}>
            @{name}
          </Text>
        ) : null}
        {message.media_url && message.media_type === 'image' ? (
          <Image
            source={{ uri: message.media_url }}
            style={styles.image}
            accessibilityLabel="Image attachment"
          />
        ) : message.media_url ? (
          <Text
            style={styles.link}
            onPress={() => Linking.openURL(message.media_url!)}
          >
            Open {message.media_type ?? 'attachment'}
          </Text>
        ) : null}
        {message.content ? <Text>{message.content}</Text> : null}
        <View style={styles.meta}>
          <Text variant="caption">{formatTime(message.created_at)}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              appreciated ? 'Remove appreciation' : 'Appreciate'
            }
            accessibilityState={{ selected: appreciated }}
            hitSlop={8}
            onPress={onAppreciate}
            style={styles.like}
          >
            <Ionicons
              name={appreciated ? 'heart' : 'heart-outline'}
              size={18}
              color={appreciated ? colors.pink : colors.ink}
            />
            {count > 0 ? <Text variant="caption">{count}</Text> : null}
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginVertical: 4,
  },
  rowMine: { justifyContent: 'flex-end' },
  bubble: {
    ...border,
    borderWidth: 2,
    borderRadius: 16,
    padding: 10,
    maxWidth: '80%',
    gap: 4,
  },
  image: { width: 220, height: 220, borderRadius: 10 },
  link: { textDecorationLine: 'underline' },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  like: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
