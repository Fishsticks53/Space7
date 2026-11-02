import React from 'react';
import { Alert } from 'react-native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import * as Keychain from 'react-native-keychain';
import App from '../App';

const fetchMock = jest.fn();
globalThis.fetch = fetchMock;

const respond = (status: number, body: unknown) =>
  fetchMock.mockResolvedValueOnce({
    ok: status < 400,
    status,
    json: () => Promise.resolve(body),
  });

beforeEach(() => fetchMock.mockReset());

test('signing in stores the session and opens the app', async () => {
  respond(200, {
    token: 't0k',
    user: { user_id: 'u1', username: 'alice', email: 'a@b.co' },
  });
  // Home screen requests after sign in.
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve([]),
  });

  await render(<App />);
  await fireEvent.changeText(
    await screen.findByLabelText('Email or username'),
    'alice',
  );
  await fireEvent.changeText(screen.getByLabelText('Password'), 'secret1');
  await fireEvent.press(screen.getByText('Sign in'));

  expect(await screen.findByText('Trending')).toBeTruthy();
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toMatch(/\/api\/auth\/login$/);
  expect(JSON.parse(init.body)).toEqual({
    identifier: 'alice',
    password: 'secret1',
  });
  expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
    'session',
    expect.stringContaining('t0k'),
    expect.anything(),
  );
});

test('a failed sign in shows the server message', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  respond(401, {
    error: 'The username/email or password you entered is incorrect',
  });

  await render(<App />);
  await fireEvent.changeText(
    await screen.findByLabelText('Email or username'),
    'alice',
  );
  await fireEvent.changeText(screen.getByLabelText('Password'), 'wrong');
  await fireEvent.press(screen.getByText('Sign in'));

  await waitFor(() =>
    expect(alert).toHaveBeenCalledWith(
      'Sign in failed',
      'The username/email or password you entered is incorrect',
    ),
  );
});
