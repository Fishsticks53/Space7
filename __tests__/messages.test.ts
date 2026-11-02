import type { Message } from '../src/api';
import {
  addMessage,
  appendPage,
  applyAppreciation,
  appreciationCount,
  isAppreciatedBy,
} from '../src/chat/messages';

const msg = (id: string, likes: string[] = []): Message => ({
  message_id: id,
  space_id: 's',
  sender_id: 'u',
  content: id,
  media_url: null,
  media_type: null,
  created_at: '2026-01-01T00:00:00Z',
  likes: likes.map(u => ({ id: `l-${u}`, user_id: u })),
  appreciation_count: likes.length,
});

test('addMessage puts new messages first and ignores duplicates', () => {
  const list = [msg('a')];
  const added = addMessage(list, msg('b'));
  expect(added.map(m => m.message_id)).toEqual(['b', 'a']);
  expect(addMessage(added, msg('b'))).toBe(added);
});

test('appendPage skips messages already loaded', () => {
  expect(
    appendPage([msg('a'), msg('b')], [msg('b'), msg('c')]).map(
      m => m.message_id,
    ),
  ).toEqual(['a', 'b', 'c']);
});

test('applyAppreciation toggles a like and is idempotent', () => {
  const liked = applyAppreciation([msg('a')], {
    messageId: 'a',
    appreciated: true,
    userId: 'me',
  });
  expect(isAppreciatedBy(liked[0], 'me')).toBe(true);
  expect(appreciationCount(liked[0])).toBe(1);
  // Our own optimistic update followed by the socket echo should not double count.
  expect(
    applyAppreciation(liked, {
      messageId: 'a',
      appreciated: true,
      userId: 'me',
    }),
  ).toEqual(liked);
  const unliked = applyAppreciation(liked, {
    messageId: 'a',
    appreciated: false,
    userId: 'me',
  });
  expect(appreciationCount(unliked[0])).toBe(0);
});
