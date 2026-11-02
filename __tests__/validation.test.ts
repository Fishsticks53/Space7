import { parseInvite } from '../src/screens/JoinSpaceScreen';
import { normalizeTag, validateSpace } from '../src/screens/NewSpaceScreen';
import { validateSignup } from '../src/screens/RegisterScreen';
import { inviteLink } from '../src/screens/SpaceDetailsScreen';

const SPACE_ID = '3f2b8c4e-1a2b-4c3d-8e9f-0a1b2c3d4e5f';

test('validateSignup mirrors the backend rules', () => {
  expect(validateSignup('ab', 'a@b.co', 'secret', 'secret')).toMatch(
    /Username/,
  );
  expect(validateSignup('alice', 'nope', 'secret', 'secret')).toMatch(/email/);
  expect(validateSignup('alice', 'a@b.co', '123', '123')).toMatch(
    /6 characters/,
  );
  expect(validateSignup('alice', 'a@b.co', 'secret', 'other')).toMatch(/match/);
  expect(validateSignup('alice', 'a@b.co', 'secret', 'secret')).toBeNull();
});

test('validateSpace mirrors the backend rules', () => {
  expect(validateSpace('ab', 'long enough description')).toMatch(/Title/);
  expect(validateSpace('Title', 'short')).toMatch(/Description/);
  expect(validateSpace('Title', 'long enough description')).toBeNull();
});

test('normalizeTag strips # and spaces and lowercases', () => {
  expect(normalizeTag('  #React Native ')).toBe('reactnative');
});

test('parseInvite reads the links that SpaceDetails shares', () => {
  expect(parseInvite(inviteLink(SPACE_ID, 'AB12CD34'))).toEqual({
    spaceId: SPACE_ID,
    code: 'AB12CD34',
  });
  expect(
    parseInvite(`Join "x" on space7: ${inviteLink(SPACE_ID, 'AB12CD34')}`).code,
  ).toBe('AB12CD34');
  expect(parseInvite(` ${SPACE_ID} `)).toEqual({ spaceId: SPACE_ID });
});
