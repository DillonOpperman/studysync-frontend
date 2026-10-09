import {
  canLeave,
  canManageJoinRequests,
  canRequestJoin,
  canViewMembers,
  joinBlockedReason,
  leaveBlockedReason,
} from '../src/features/groups/membership';
import { group } from '../src/testSupport/groupFixtures';

describe('membership UI rules', () => {
  it('lets outsiders request to join only when the group is open', () => {
    expect(canRequestJoin(group())).toBe(true);
    expect(canRequestJoin(group({ pendingJoinRequest: true }))).toBe(false);
    expect(joinBlockedReason(group({ pendingJoinRequest: true }))).toMatch(
      /waiting/,
    );
    expect(canRequestJoin(group({ memberCount: 6, maxMembers: 6 }))).toBe(
      false,
    );
    expect(joinBlockedReason(group({ memberCount: 6, maxMembers: 6 }))).toBe(
      'This group is full.',
    );
  });

  it('hides join-request management from ordinary members', () => {
    const member = group({
      membershipStatus: 'member',
      isLeader: false,
    });
    expect(canManageJoinRequests(member)).toBe(false);
    expect(canViewMembers(member)).toBe(true);
    expect(
      canManageJoinRequests(
        group({ membershipStatus: 'leader', isLeader: true }),
      ),
    ).toBe(true);
  });

  it('blocks leaders from leaving while other members remain', () => {
    const leaderWithMembers = group({
      membershipStatus: 'leader',
      isLeader: true,
      memberCount: 3,
    });
    expect(canLeave(leaderWithMembers)).toBe(false);
    expect(leaveBlockedReason(leaderWithMembers)).toMatch(/cannot leave/);
    expect(
      canLeave(
        group({
          membershipStatus: 'leader',
          isLeader: true,
          memberCount: 1,
        }),
      ),
    ).toBe(true);
    expect(
      canLeave(group({ membershipStatus: 'member', isLeader: false })),
    ).toBe(true);
  });
});
