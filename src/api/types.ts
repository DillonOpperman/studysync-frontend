/** camelCase DTOs matching studysync-backend-rs `src/api/dto.rs`. */

export type AvailabilityInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
};

export type GroupPreferencesInput = {
  preferredGroupSizeMin?: number;
  preferredGroupSizeMax?: number;
  groupSize?: number;
  sessionDurationMinutes?: number;
  sessionDuration?: number;
  studyGoals?: string[];
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  institutionId?: string;
  institutionName?: string;
  institutionDomain?: string;
  major: string;
  year: string;
  learningStyle?: string;
  studyEnvironments?: string[];
  studyMethods?: string[];
  subjects?: string[];
  availability?: AvailabilityInput[];
  performanceLevel?: number;
  groupPreferences?: GroupPreferencesInput;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type InstitutionDto = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
};

export type CourseDto = {
  id: string;
  name: string;
  courseCode: string | null;
};

export type AvailabilityDto = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
};

export type GroupPreferencesDto = {
  preferredGroupSizeMin: number;
  preferredGroupSizeMax: number;
  sessionDurationMinutes: number;
};

export type MediaDto = {
  id: string;
  fileName: string;
  contentType: string;
  byteSize: number;
  kind: string;
  status: string;
  downloadUrl: string | null;
};

export type UserProfileDto = {
  id: string;
  name: string;
  email: string;
  institution: InstitutionDto;
  major: string;
  year: string;
  learningStyle: string;
  performanceLevel: number;
  profilePictureKey: string | null;
  profilePicture: MediaDto | null;
  studyEnvironments: string[];
  studyMethods: string[];
  studyGoals: string[];
  subjects: CourseDto[];
  availability: AvailabilityDto[];
  groupPreferences: GroupPreferencesDto;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserProfileDto;
};

export type UserSummaryDto = {
  id: string;
  name: string;
  profilePictureKey?: string | null;
};

export type RecurringSlotDto = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
};

export type GroupDto = {
  id: string;
  title: string;
  subject: string;
  courseId: string | null;
  description: string;
  location: string;
  maxMembers: number;
  memberCount: number;
  leader: UserSummaryDto;
  status: string;
  membershipStatus: string;
  pendingJoinRequest: boolean;
  isLeader: boolean;
  recurringSlots: RecurringSlotDto[];
  createdAt: string;
  updatedAt: string;
};

export type CreateGroupRequest = {
  title: string;
  subject: string;
  courseId?: string;
  description?: string;
  location?: string;
  maxMembers: number;
  recurringSlots?: AvailabilityInput[];
};

export type GroupMemberDto = {
  userId: string;
  name: string;
  profilePictureKey: string | null;
  role: string;
  joinedAt: string;
};

export type JoinRequestDto = {
  id: string;
  groupId: string;
  status: string;
  createdAt: string;
  decidedAt: string | null;
  requester: UserSummaryDto;
};

export type SearchMode = 'fullText' | 'semantic';

export type GroupSearchRequest = {
  query: string;
  mode?: SearchMode;
  limit?: number;
  offset?: number;
  threshold?: number;
};

export type GroupSearchResultDto = {
  group: GroupDto;
  score: number;
};

export type GroupSearchResponse = {
  mode: string;
  query: string;
  results: GroupSearchResultDto[];
  limit: number;
  offset: number;
};

export type RecommendedGroupDto = {
  group: GroupDto;
  score: number;
  groupSubject: number;
  leaderSubjectSimilarity: number;
  scheduleOverlap: number;
  sizeMatch: number;
};

export type RecommendResponse = {
  groups: RecommendedGroupDto[];
  createNew: boolean;
  formula: string;
  modelId: string;
  semanticAvailable: boolean;
};

export type ChatMessageType = 'text' | 'announcement' | 'image' | 'file';

export type ReactionCountDto = {
  emoji: string;
  count: number;
  me: boolean;
};

export type ChatAttachmentDto = MediaDto;

export type GroupMessageDto = {
  id: string;
  groupId: string;
  senderId: string;
  clientMsgId: string;
  content: string;
  messageType: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  reactions: ReactionCountDto[];
  attachments: ChatAttachmentDto[];
};

export type SendGroupMessageRequest = {
  clientMsgId: string;
  content: string;
  messageType?: ChatMessageType;
  attachmentIds?: string[];
};

export type GroupMessagePageDto = {
  messages: GroupMessageDto[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextBefore: string | null;
    nextAfter: string | null;
  };
};

export type ReactionStateDto = {
  messageId: string;
  groupId: string;
  reactions: ReactionCountDto[];
};

export type FriendRequestDto = {
  id: string;
  status: string;
  createdAt: string;
  decidedAt: string | null;
  requester: UserSummaryDto;
  recipient: UserSummaryDto;
};

export type FriendRequestListDto = {
  incoming: FriendRequestDto[];
  outgoing: FriendRequestDto[];
};

export type FriendListDto = {
  user: UserSummaryDto;
  friendsSince: string;
};

/** Matches `NotificationDto` in studysync-backend-rs `src/api/dto.rs`. */
export type NotificationDto = {
  id: string;
  type: string;
  title: string;
  body: string;
  data: unknown;
  readAt: string | null;
  createdAt: string;
};

/** Backend default 20, clamp 1–50 (`services::notifications::list`). */
export const NOTIFICATION_LIST_DEFAULT_LIMIT = 20;
export const NOTIFICATION_LIST_MAX_LIMIT = 50;

export type DirectMessageDto = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string;
  createdAt: string;
  readAt: string | null;
  attachments: MediaDto[];
};

export type MessageRequestDto = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sender: UserSummaryDto;
  receiver: UserSummaryDto;
};

export type SendDirectMessageRequest = {
  recipientId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file';
  attachmentIds?: string[];
};

export type SendDirectMessageResult =
  | {
      kind: 'directMessage';
      status: number;
      message: DirectMessageDto;
    }
  | {
      kind: 'messageRequest';
      status: number;
      messageRequest: MessageRequestDto;
    };

export const MAX_GROUP_MESSAGE_CHARS = 4000;
export const MAX_DIRECT_MESSAGE_CHARS = 4000;
/** Matches backend default `MEDIA_MAX_BYTES` (10 MiB). */
export const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
export const MAX_MESSAGE_ATTACHMENTS = 5;
export const MEDIA_PURPOSE_GROUP = 'group_message';
export const MEDIA_PURPOSE_DIRECT = 'direct_message';
export const GROUP_MESSAGE_EDIT_WINDOW_MS = 15 * 60 * 1000;
export const CHAT_REACTION_CHOICES = ['👍', '❤️', '😂', '🎉', '👀'] as const;

export const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const COMMON_TIMEZONES = [
  'America/Chicago',
  'America/New_York',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'UTC',
] as const;

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

export const VALID_YEARS = [
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Graduate',
] as const;

export type YearValue = (typeof VALID_YEARS)[number];
