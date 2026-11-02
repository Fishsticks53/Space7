import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import * as Keychain from 'react-native-keychain';
import { AuthProvider, useAuth } from '../src/auth/AuthContext';
import { ChatScreen } from '../src/screens/ChatScreen';
import type { AppStackParamList } from '../src/navigation/types';

const SPACE_ID = 'space-1';
const me = { user_id: 'me', username: 'me', email: 'me@x.co' };

const space = (members: { user_id: string; role: 'creator' | 'member' }[]) => ({
  space_id: SPACE_ID,
  title: 'Rust tips',
  description: 'All things rust',
  creator_id: 'other',
  visibility: 'public',
  is_locked: false,
  is_archived: false,
  created_at: '2026-01-01T00:00:00Z',
  participant_count: members.length,
  message_count: 0,
  members: members.map(m => ({
    id: m.user_id,
    ...m,
    user: { user_id: m.user_id, username: m.user_id, profile_picture: null },
  })),
});

type Route = { method: string; path: RegExp; status: number; body: unknown };
let routes: Route[] = [];
const fetchMock = jest.fn((url: string, init: RequestInit = {}) => {
  const method = init.method ?? 'GET';
  const route = routes.find(r => r.method === method && r.path.test(url));
  if (!route) throw new Error(`Unexpected ${method} ${url}`);
  return Promise.resolve({
    ok: route.status < 400,
    status: route.status,
    json: () => Promise.resolve(route.body),
  });
});
globalThis.fetch = fetchMock as unknown as typeof fetch;

const Stack = createNativeStackNavigator<AppStackParamList>();
const Placeholder = () => null;

function WaitForAuth() {
  const { status } = useAuth();
  if (status !== 'signedIn') return null;
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        initialParams={{ spaceId: SPACE_ID }}
      />
      <Stack.Screen name="JoinSpace" component={Placeholder} />
    </Stack.Navigator>
  );
}

const renderChat = () =>
  render(
    <AuthProvider>
      <NavigationContainer>
        <WaitForAuth />
      </NavigationContainer>
    </AuthProvider>,
  );

beforeEach(() => {
  fetchMock.mockClear();
  (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
    password: JSON.stringify({ token: 't', user: me }),
  });
});

test('a non-member of a public space can read it and join', async () => {
  routes = [
    {
      method: 'GET',
      path: /\/spaces\/space-1$/,
      status: 200,
      body: space([{ user_id: 'other', role: 'creator' }]),
    },
    {
      method: 'GET',
      path: /\/messages\/space-1\?/,
      status: 200,
      body: { messages: [], total: 0, page: 1, totalPages: 0 },
    },
    {
      method: 'POST',
      path: /\/spaces\/space-1\/join$/,
      status: 200,
      body: { message: 'Joined space successfully' },
    },
  ];
  await renderChat();
  expect(await screen.findByText('Join this space to take part.')).toBeTruthy();

  // After joining, the space reloads with us as a member and the composer appears.
  routes[0] = {
    ...routes[0],
    body: space([
      { user_id: 'other', role: 'creator' },
      { user_id: 'me', role: 'member' },
    ]),
  };
  await fireEvent.press(screen.getByText('Join space'));
  expect(await screen.findByLabelText('Message')).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringMatching(/\/spaces\/space-1\/join$/),
    expect.objectContaining({ method: 'POST' }),
  );
});

test('a private space the user is not in asks for an invite code', async () => {
  routes = [
    {
      method: 'GET',
      path: /\/spaces\/space-1$/,
      status: 403,
      body: { error: 'This space is private' },
    },
  ];
  await renderChat();
  expect(await screen.findByText('Enter invite code')).toBeTruthy();
});

test('sending a message posts it and shows it once', async () => {
  const sent = {
    message_id: 'm1',
    space_id: SPACE_ID,
    sender_id: 'me',
    content: 'hello',
    media_url: null,
    media_type: null,
    created_at: new Date().toISOString(),
    sender: { user_id: 'me', username: 'me', profile_picture: null },
  };
  routes = [
    {
      method: 'GET',
      path: /\/spaces\/space-1$/,
      status: 200,
      body: space([{ user_id: 'me', role: 'creator' }]),
    },
    {
      method: 'GET',
      path: /\/messages\/space-1\?/,
      status: 200,
      body: { messages: [], total: 0, page: 1, totalPages: 0 },
    },
    { method: 'POST', path: /\/messages\/space-1$/, status: 201, body: sent },
  ];
  await renderChat();
  await fireEvent.changeText(await screen.findByLabelText('Message'), 'hello');
  await fireEvent.press(screen.getByLabelText('Send'));
  await waitFor(() => expect(screen.getAllByText('hello')).toHaveLength(1));
});
