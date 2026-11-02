import { request } from './client';
import type {
  AuthUser,
  Message,
  MessagePage,
  NotificationPage,
  Profile,
  PublicProfile,
  Space,
  SpaceDetails,
  UserSummary,
  Visibility,
} from './types';

export { ApiError } from './client';
export * from './types';

type AuthResult = { token: string; user: AuthUser };
type Ok = { message: string };
const q = encodeURIComponent;

// ── Auth ──
export const signup = (username: string, email: string, password: string) =>
  request<{ email: string }>('/auth/signup', {
    method: 'POST',
    body: { username, email, password },
  });
export const verifyOtp = (email: string, otp: string) =>
  request<AuthResult>('/auth/verify-otp', {
    method: 'POST',
    body: { email, otp },
  });
export const login = (identifier: string, password: string) =>
  request<AuthResult>('/auth/login', {
    method: 'POST',
    body: { identifier, password },
  });
export const forgotPassword = (email: string) =>
  request<Ok>('/auth/forgot-password', { method: 'POST', body: { email } });
export const resetPassword = (
  email: string,
  otp: string,
  newPassword: string,
) =>
  request<Ok>('/auth/reset-password', {
    method: 'POST',
    body: { email, otp, newPassword },
  });

// ── Spaces ──
export const trendingSpaces = (limit = 10) =>
  request<Space[]>(`/spaces/trending?limit=${limit}`);
export const recommendedSpaces = (limit = 10) =>
  request<Space[]>(`/spaces/recommended?limit=${limit}`);
export const searchSpaces = (query: string) =>
  request<Space[]>(`/spaces/search?q=${q(query)}`);
export const spacesByTag = (tag: string) =>
  request<Space[]>(`/spaces/tag/${q(tag.replace(/^#/, ''))}`);
export const mySpaces = (visibility?: Visibility) =>
  request<Space[]>(
    `/spaces/my${visibility ? `?visibility=${visibility}` : ''}`,
  );
export const getSpace = (spaceId: string) =>
  request<SpaceDetails>(`/spaces/${spaceId}`);
export const createSpace = (input: {
  title: string;
  description: string;
  visibility: Visibility;
  hashtags: string[];
}) => request<SpaceDetails>('/spaces', { method: 'POST', body: input });
export const joinSpace = (spaceId: string, inviteCode?: string) =>
  request<Ok>(`/spaces/${spaceId}/join`, {
    method: 'POST',
    body: inviteCode ? { invite_code: inviteCode } : {},
  });
export const createInviteCode = (spaceId: string) =>
  request<{ code: string; expires_at: string }>(`/spaces/${spaceId}/invite`, {
    method: 'POST',
  });
export const removeMember = (spaceId: string, userId: string) =>
  request<Ok>(`/spaces/${spaceId}/members/${userId}`, { method: 'DELETE' });
export const toggleLock = (spaceId: string) =>
  request<{ is_locked: boolean }>(`/spaces/${spaceId}/lock`, { method: 'PUT' });
export const archiveSpace = (spaceId: string) =>
  request<Ok>(`/spaces/${spaceId}/archive`, { method: 'PUT' });

// ── Messages ──
export const getMessages = (
  spaceId: string,
  {
    page = 1,
    sort = 'recent',
  }: { page?: number; sort?: 'recent' | 'most_appreciated' } = {},
) => request<MessagePage>(`/messages/${spaceId}?page=${page}&sort=${sort}`);
export const sendMessage = (
  spaceId: string,
  body: { content: string } | FormData,
) => request<Message>(`/messages/${spaceId}`, { method: 'POST', body });
export const toggleAppreciation = (spaceId: string, messageId: string) =>
  request<{ appreciated: boolean }>(
    `/messages/${spaceId}/${messageId}/appreciate`,
    { method: 'POST' },
  );
export const deleteMessage = (spaceId: string, messageId: string) =>
  request<Ok>(`/messages/${spaceId}/${messageId}`, { method: 'DELETE' });

// ── Profile ──
export const getMyProfile = () => request<Profile>('/profile/me');
export const getUserProfile = (userId: string) =>
  request<PublicProfile>(`/profile/user/${userId}`);
export const searchUsers = (query: string) =>
  request<(UserSummary & { bio: string | null })[]>(
    `/profile/search?q=${q(query)}`,
  );
export const updateUsername = (username: string) =>
  request<{ username: string }>('/profile/username', {
    method: 'PUT',
    body: { username },
  });
export const updateBio = (bio: string) =>
  request<{ bio: string }>('/profile/bio', { method: 'PUT', body: { bio } });
export const updateAvatar = (form: FormData) =>
  request<{ profile_picture: string }>('/profile/picture', {
    method: 'PUT',
    body: form,
  });
export const changePassword = (currentPassword: string, newPassword: string) =>
  request<Ok>('/profile/password', {
    method: 'PUT',
    body: { currentPassword, newPassword },
  });
export const deleteAccount = () =>
  request<Ok>('/profile/account', { method: 'DELETE' });

// ── Notifications ──
export const getNotifications = (page = 1) =>
  request<NotificationPage>(`/notifications?page=${page}`);
export const markNotificationRead = (id: string) =>
  request<Ok>(`/notifications/${id}/read`, { method: 'PUT' });
export const markAllNotificationsRead = () =>
  request<Ok>('/notifications/read-all', { method: 'PUT' });
