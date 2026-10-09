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
  id?: string;
  key?: string;
  contentType?: string;
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
