import {
  ApiError,
  request,
  setAuthToken,
  setUnauthorizedHandler,
} from '../src/api/client';

const mockFetch = (status: number, body: unknown) =>
  jest.fn(() =>
    Promise.resolve({
      ok: status < 400,
      status,
      json: () => Promise.resolve(body),
    }),
  ) as jest.Mock;

afterEach(() => {
  setAuthToken(null);
  setUnauthorizedHandler(null);
});

test("surfaces the backend's error field instead of a generic message", async () => {
  globalThis.fetch = mockFetch(400, { error: 'Space is locked' });
  await expect(request('/x')).rejects.toMatchObject({
    message: 'Space is locked',
    status: 400,
  });
});

test('joins validation details into the message', async () => {
  globalThis.fetch = mockFetch(400, {
    error: 'Validation error',
    details: ['"title" is required'],
  });
  await expect(request('/x')).rejects.toThrow('"title" is required');
});

test('sends the bearer token and JSON body', async () => {
  const fetchMock = mockFetch(200, { ok: true });
  globalThis.fetch = fetchMock;
  setAuthToken('abc');
  await request('/spaces', { method: 'POST', body: { title: 't' } });
  const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
  expect(init.headers).toMatchObject({
    Authorization: 'Bearer abc',
    'Content-Type': 'application/json',
  });
  expect(init.body).toBe('{"title":"t"}');
});

test('a 401 on a signed-in request ends the session', async () => {
  globalThis.fetch = mockFetch(401, { error: 'Invalid or expired token' });
  const handler = jest.fn();
  setAuthToken('expired');
  setUnauthorizedHandler(handler);
  await expect(request('/profile/me')).rejects.toBeInstanceOf(ApiError);
  expect(handler).toHaveBeenCalled();
});

test('a 401 from a failed login does not trigger sign out', async () => {
  globalThis.fetch = mockFetch(401, { error: 'Wrong password' });
  const handler = jest.fn();
  setUnauthorizedHandler(handler);
  await expect(request('/auth/login')).rejects.toThrow('Wrong password');
  expect(handler).not.toHaveBeenCalled();
});

test('network failures get a readable message', async () => {
  globalThis.fetch = jest.fn(() =>
    Promise.reject(new TypeError('Network request failed')),
  );
  await expect(request('/x')).rejects.toMatchObject({
    status: 0,
    message: expect.stringMatching(/reach the server/),
  });
});
