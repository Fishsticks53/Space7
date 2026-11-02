import type { Message } from '../api';

// Message lists are kept newest first, matching the API's "recent" order.

/** Add a message unless it is already present (our own POST and the socket broadcast both deliver it). */
export function addMessage(list: Message[], message: Message): Message[] {
  if (list.some(m => m.message_id === message.message_id)) return list;
  return [message, ...list];
}

/** Append an older page, dropping anything we already have. */
export function appendPage(list: Message[], page: Message[]): Message[] {
  const seen = new Set(list.map(m => m.message_id));
  return [...list, ...page.filter(m => !seen.has(m.message_id))];
}

/** Apply a like/unlike from a given user. Idempotent, so a socket echo of our own tap is harmless. */
export function applyAppreciation(
  list: Message[],
  {
    messageId,
    appreciated,
    userId,
  }: { messageId: string; appreciated: boolean; userId: string },
): Message[] {
  return list.map(m => {
    if (m.message_id !== messageId) return m;
    const likes = m.likes ?? [];
    const has = likes.some(l => l.user_id === userId);
    if (has === appreciated) return m;
    const next = appreciated
      ? [...likes, { id: `local-${userId}`, user_id: userId }]
      : likes.filter(l => l.user_id !== userId);
    return { ...m, likes: next, appreciation_count: next.length };
  });
}

export function isAppreciatedBy(message: Message, userId: string) {
  return (message.likes ?? []).some(l => l.user_id === userId);
}

export function appreciationCount(message: Message) {
  return message.appreciation_count ?? message.likes?.length ?? 0;
}
