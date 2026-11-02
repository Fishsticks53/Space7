// Shapes returned by space7-backend.

export type Visibility = 'public' | 'private';

export interface UserSummary {
  user_id: string;
  username: string;
  profile_picture: string | null;
}

export interface AuthUser {
  user_id: string;
  username: string;
  email: string;
}

export interface Tag {
  tag_id: string;
  tag_name: string;
}

export interface Space {
  space_id: string;
  title: string;
  description: string;
  creator_id: string;
  visibility: Visibility;
  is_locked: boolean;
  is_archived: boolean;
  created_at: string;
  creator?: UserSummary;
  tags?: Tag[];
  participant_count: number;
  role?: 'creator' | 'member';
}

export interface SpaceMember {
  id: string;
  user_id: string;
  role: 'creator' | 'member';
  user: UserSummary;
}

export interface SpaceDetails extends Space {
  members: SpaceMember[];
  message_count: number;
}

export interface Message {
  message_id: string;
  space_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  media_type: 'image' | 'video' | 'audio' | null;
  created_at: string;
  sender?: UserSummary;
  likes?: { id: string; user_id: string }[];
  appreciation_count?: number;
}

export interface MessagePage {
  messages: Message[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProfileStats {
  spaces_created: number;
  spaces_participated: number;
  total_words_contributed: number;
  total_appreciations_received: number;
}

export interface Profile extends UserSummary {
  email: string;
  bio: string | null;
  created_at: string;
  stats: ProfileStats;
}

export interface PublicProfile extends Omit<Profile, 'email'> {
  publicSpaces: Pick<
    Space,
    'space_id' | 'title' | 'description' | 'created_at'
  >[];
}

export type NotificationType =
  | 'invite_used'
  | 'new_message'
  | 'space_archived'
  | 'space_locked'
  | 'appreciation_received';

export interface AppNotification {
  notification_id: string;
  type: NotificationType;
  reference_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPage {
  notifications: AppNotification[];
  total: number;
  page: number;
  totalPages: number;
  unreadCount: number;
}
