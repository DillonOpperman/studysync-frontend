import type { GroupDto } from '../../api/types';

export function isActiveMember(group: GroupDto): boolean {
  return (
    group.membershipStatus === 'leader' || group.membershipStatus === 'member'
  );
}

export function canRequestJoin(group: GroupDto): boolean {
  return (
    group.status === 'active' &&
    group.membershipStatus === 'none' &&
    !group.pendingJoinRequest &&
    group.memberCount < group.maxMembers
  );
}

export function joinBlockedReason(group: GroupDto): string | null {
  if (isActiveMember(group)) {
    return null;
  }
  if (group.status !== 'active') {
    return 'This group is archived.';
  }
  if (group.pendingJoinRequest) {
    return 'Your join request is waiting for the leader.';
  }
  if (group.memberCount >= group.maxMembers) {
    return 'This group is full.';
  }
  return null;
}

export function canLeave(group: GroupDto): boolean {
  if (!isActiveMember(group) || group.status !== 'active') {
    return false;
  }
  if (group.isLeader && group.memberCount > 1) {
    return false;
  }
  return true;
}

export function leaveBlockedReason(group: GroupDto): string | null {
  if (!group.isLeader || group.memberCount <= 1) {
    return null;
  }
  return 'Leaders cannot leave while other members remain. Transfer is not available yet.';
}

export function canManageJoinRequests(group: GroupDto): boolean {
  return group.isLeader && group.status === 'active';
}

export function canViewMembers(group: GroupDto): boolean {
  return isActiveMember(group);
}
