import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import * as api from '../api';
import { ApiError, type Message } from '../api';
import { useAuth } from '../auth/AuthContext';
import {
  addMessage,
  appendPage,
  applyAppreciation,
  isAppreciatedBy,
} from '../chat/messages';
import { MessageBubble } from '../chat/MessageBubble';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { EmptyState, ErrorState, Loading } from '../components/StateViews';
import { Text } from '../components/Text';
import { useAsync } from '../hooks/useAsync';
import type { AppStackParamList } from '../navigation/types';
import { getSocket } from '../socket';
import { border, colors, fonts } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Chat'>;
type Sort = 'recent' | 'most_appreciated';

export function ChatScreen({ navigation, route }: Props) {
  const { spaceId } = route.params;
  const { user, token } = useAuth();
  const me = user!.user_id;

  const space = useAsync(() => api.getSpace(spaceId), [spaceId]);
  const [sort, setSort] = useState<Sort>('recent');
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState<Asset | null>(null);
  const [sending, setSending] = useState(false);
  const [joining, setJoining] = useState(false);

  const details = space.data;
  const membership = details?.members.find(m => m.user_id === me);
  const isCreator = membership?.role === 'creator';

  // First page whenever the space loads or the sort changes.
  useEffect(() => {
    if (!details) return;
    let cancelled = false;
    setLoadingMessages(true);
    api
      .getMessages(spaceId, { page: 1, sort })
      .then(res => {
        if (cancelled) return;
        setMessages(res.messages);
        setPage(1);
        setTotalPages(res.totalPages);
      })
      .catch(
        e =>
          !cancelled &&
          Alert.alert('Could not load messages', (e as Error).message),
      )
      .finally(() => !cancelled && setLoadingMessages(false));
    return () => {
      cancelled = true;
    };
  }, [details, spaceId, sort]);

  // Live updates for this space.
  useEffect(() => {
    if (!details || !token) return;
    const socket = getSocket(token);
    const join = () => socket.emit('join_space', spaceId);
    const onMessage = (message: Message) => {
      if (message.space_id !== spaceId) return;
      setMessages(list =>
        sort === 'recent' ? addMessage(list, message) : list,
      );
    };
    const onAppreciated = (event: {
      messageId: string;
      appreciated: boolean;
      userId: string;
    }) => setMessages(list => applyAppreciation(list, event));

    join();
    socket.on('connect', join);
    socket.on('receive_message', onMessage);
    socket.on('message_appreciated', onAppreciated);
    return () => {
      socket.emit('leave_space', spaceId);
      socket.off('connect', join);
      socket.off('receive_message', onMessage);
      socket.off('message_appreciated', onAppreciated);
    };
  }, [details, token, spaceId, sort]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loadingMessages || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const res = await api.getMessages(spaceId, { page: page + 1, sort });
      setMessages(list => appendPage(list, res.messages));
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch {
      // Leave the list as is; the next scroll retries.
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loadingMessages, page, totalPages, spaceId, sort]);

  const pickImage = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });
    if (res.errorMessage)
      Alert.alert('Could not open photos', res.errorMessage);
    else if (res.assets?.[0]) setAttachment(res.assets[0]);
  };

  const send = async () => {
    const content = draft.trim();
    if (!content && !attachment) return;
    setSending(true);
    try {
      let body: { content: string } | FormData = { content };
      if (attachment?.uri) {
        body = new FormData();
        if (content) body.append('content', content);
        body.append('media', {
          uri: attachment.uri,
          name: attachment.fileName ?? 'photo.jpg',
          type: attachment.type ?? 'image/jpeg',
        } as unknown as Blob);
      }
      const created = await api.sendMessage(spaceId, body);
      setMessages(list => addMessage(list, created));
      setDraft('');
      setAttachment(null);
    } catch (e) {
      Alert.alert('Message not sent', (e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const appreciate = async (message: Message) => {
    const appreciated = !isAppreciatedBy(message, me);
    setMessages(list =>
      applyAppreciation(list, {
        messageId: message.message_id,
        appreciated,
        userId: me,
      }),
    );
    try {
      await api.toggleAppreciation(spaceId, message.message_id);
    } catch (e) {
      setMessages(list =>
        applyAppreciation(list, {
          messageId: message.message_id,
          appreciated: !appreciated,
          userId: me,
        }),
      );
      Alert.alert('Could not update', (e as Error).message);
    }
  };

  const confirmDelete = (message: Message) =>
    Alert.alert('Delete message', 'This removes the message for everyone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteMessage(spaceId, message.message_id);
            setMessages(list =>
              list.filter(m => m.message_id !== message.message_id),
            );
          } catch (e) {
            Alert.alert('Could not delete', (e as Error).message);
          }
        },
      },
    ]);

  const join = async () => {
    setJoining(true);
    try {
      await api.joinSpace(spaceId);
      space.refresh();
    } catch (e) {
      Alert.alert('Could not join', (e as Error).message);
    } finally {
      setJoining(false);
    }
  };

  const title = details?.title ?? route.params.title ?? 'Space';

  if (space.loading) {
    return (
      <Screen>
        <Header title={title} />
        <Loading />
      </Screen>
    );
  }

  if (space.error || !details) {
    const isPrivate =
      space.error instanceof ApiError && space.error.status === 403;
    return (
      <Screen>
        <Header title={title} />
        {isPrivate ? (
          <EmptyState
            message="This space is private. Ask its creator for an invite code to join."
            action={
              <Button
                title="Enter invite code"
                onPress={() => navigation.replace('JoinSpace', { spaceId })}
              />
            }
          />
        ) : (
          <ErrorState
            error={space.error ?? new Error('Space not found')}
            onRetry={space.refresh}
          />
        )}
      </Screen>
    );
  }

  const composerNotice = details.is_archived
    ? 'This space is archived. It is read only.'
    : details.is_locked
    ? 'This space is locked. New messages are paused.'
    : null;

  return (
    <Screen>
      <Header
        title={title}
        color={colors.green}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Space details"
            onPress={() => navigation.navigate('SpaceDetails', { spaceId })}
          >
            <Ionicons
              name="information-circle-outline"
              size={28}
              color={colors.ink}
            />
          </Pressable>
        }
      />
      <View style={styles.sortRow}>
        {(['recent', 'most_appreciated'] as const).map(s => (
          <Pressable
            key={s}
            accessibilityRole="button"
            accessibilityState={{ selected: sort === s }}
            onPress={() => setSort(s)}
            style={[styles.sortChip, sort === s && styles.sortActive]}
          >
            <Text variant="label">
              {s === 'recent' ? 'Recent' : 'Most appreciated'}
            </Text>
          </Pressable>
        ))}
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loadingMessages ? (
          <Loading />
        ) : (
          <FlatList
            style={styles.flex}
            data={messages}
            // Newest at the bottom for the live feed; best first for "most appreciated".
            inverted={sort === 'recent'}
            keyExtractor={m => m.message_id}
            contentContainerStyle={styles.list}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loadingMore ? <ActivityIndicator color={colors.ink} /> : undefined
            }
            ListEmptyComponent={
              <View
                style={[styles.emptyList, sort === 'recent' && styles.flipped]}
              >
                <Text variant="label">
                  No messages yet. Start the conversation!
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const mine = item.sender_id === me;
              return (
                <MessageBubble
                  message={item}
                  mine={mine}
                  appreciated={isAppreciatedBy(item, me)}
                  onAppreciate={() => appreciate(item)}
                  onLongPress={
                    mine || isCreator ? () => confirmDelete(item) : undefined
                  }
                  onOpenSender={() =>
                    navigation.navigate('UserProfile', {
                      userId: item.sender_id,
                    })
                  }
                />
              );
            }}
          />
        )}
        {!membership ? (
          <View style={styles.footer}>
            <Text variant="label">Join this space to take part.</Text>
            <Button title="Join space" onPress={join} loading={joining} />
          </View>
        ) : composerNotice ? (
          <View style={styles.footer}>
            <Text variant="label">{composerNotice}</Text>
          </View>
        ) : (
          <View style={styles.footer}>
            {attachment?.uri ? (
              <View style={styles.preview}>
                <Image
                  source={{ uri: attachment.uri }}
                  style={styles.previewImage}
                  accessibilityLabel="Selected image"
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove image"
                  onPress={() => setAttachment(null)}
                >
                  <Ionicons name="close-circle" size={26} color={colors.ink} />
                </Pressable>
              </View>
            ) : null}
            <View style={styles.composer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Attach image"
                onPress={pickImage}
                hitSlop={6}
              >
                <Ionicons name="image-outline" size={26} color={colors.ink} />
              </Pressable>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Type a message..."
                placeholderTextColor={colors.muted}
                multiline
                maxLength={5000}
                style={styles.input}
                accessibilityLabel="Message"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Send"
                onPress={send}
                disabled={sending}
                style={styles.send}
              >
                {sending ? (
                  <ActivityIndicator color={colors.ink} />
                ) : (
                  <Ionicons name="send" size={20} color={colors.ink} />
                )}
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sortChip: {
    ...border,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
    backgroundColor: colors.surface,
  },
  sortActive: { backgroundColor: colors.yellow },
  list: { padding: 12, flexGrow: 1 },
  emptyList: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  flipped: { transform: [{ scaleY: -1 }] },
  footer: {
    borderTopWidth: border.borderWidth,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    padding: 10,
    gap: 8,
  },
  preview: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  previewImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    ...border,
    borderWidth: 2,
  },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: {
    ...border,
    borderWidth: 2,
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 120,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.ink,
    backgroundColor: colors.background,
  },
  send: {
    ...border,
    borderWidth: 2,
    borderRadius: 14,
    padding: 10,
    backgroundColor: colors.yellow,
  },
});
