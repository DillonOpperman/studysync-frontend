import type {
  GroupDto,
  GroupMemberDto,
  JoinRequestDto,
  RecommendedGroupDto,
} from '../api/types';

export function group(overrides: Partial<GroupDto> = {}): GroupDto {
  return {
    id: 'g1',
    title: 'Algo night',
    subject: 'Algorithms',
    courseId: null,
    description: 'Weekly problem set',
    location: 'Library',
    maxMembers: 6,
    memberCount: 2,
    leader: { id: 'u-leader', name: 'Ada' },
    status: 'active',
    membershipStatus: 'none',
    pendingJoinRequest: false,
    isLeader: false,
    recurringSlots: [
      {
        id: 's1',
        dayOfWeek: 0,
        startTime: '17:00:00',
        endTime: '21:00:00',
        timezone: 'America/Chicago',
      },
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

export function member(
  overrides: Partial<GroupMemberDto> = {},
): GroupMemberDto {
  return {
    userId: 'u-leader',
    name: 'Ada',
    profilePictureKey: null,
    role: 'leader',
    joinedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

export function joinRequest(
  overrides: Partial<JoinRequestDto> = {},
): JoinRequestDto {
  return {
    id: 'jr1',
    groupId: 'g1',
    status: 'pending',
    createdAt: '2026-01-02T00:00:00Z',
    decidedAt: null,
    requester: { id: 'u2', name: 'Grace' },
    ...overrides,
  };
}

export function recommended(
  overrides: Partial<RecommendedGroupDto> = {},
): RecommendedGroupDto {
  return {
    group: group({ id: 'g-rec', title: 'Calc lab' }),
    score: 0.62,
    groupSubject: 0.8,
    leaderSubjectSimilarity: 0.4,
    scheduleOverlap: 0.5,
    sizeMatch: 0.7,
    ...overrides,
  };
}
