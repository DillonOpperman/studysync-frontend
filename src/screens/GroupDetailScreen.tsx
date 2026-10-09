import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

import { userFacingMessage } from '../api/errors';
import type { GroupDto, GroupMemberDto, JoinRequestDto } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { GroupListSkeleton } from '../components/Skeleton';
import { groupsApi } from '../features/groups/groupsApi';
import {
  canLeave,
  canManageJoinRequests,
  canRequestJoin,
  canViewMembers,
  isActiveMember,
  joinBlockedReason,
  leaveBlockedReason,
} from '../features/groups/membership';
import { formatSlot } from '../features/groups/validateCreate';
import type { AppStackParamList } from '../navigation/types';
import { hairlineWidth, useTheme } from '../theme';

export function GroupDetailScreen({
  navigation,
  route,
}: NativeStackScreenProps<AppStackParamList, 'GroupDetail'>) {
  const theme = useTheme();
  const { client } = useAuth();
  const { groupId } = route.params;
  const [group, setGroup] = useState<GroupDto | null>(null);
  const [members, setMembers] = useState<GroupMemberDto[] | null>(null);
  const [requests, setRequests] = useState<JoinRequestDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const load = useCallback(async () => {
    const api = groupsApi(client);
    setError(null);
    try {
      const next = await api.get(groupId);
      setGroup(next);
      if (canViewMembers(next)) {
        setMembers(await api.members(groupId));
      } else {
        setMembers(null);
      }
      if (canManageJoinRequests(next)) {
        setRequests(await api.listJoinRequests(groupId));
      } else {
        setRequests(null);
      }
    } catch (caught) {
      setError(userFacingMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [client, groupId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function run(action: () => Promise<void>) {
    if (busyRef.current) {
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await load();
    } catch (caught) {
      setActionError(userFacingMessage(caught));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  if (loading && !group) {
    return (
      <Screen>
        <ScreenHeader title="Group" onBack={() => navigation.goBack()} />
        <GroupListSkeleton />
      </Screen>
    );
  }

  if (!group) {
    return (
      <Screen>
        <ScreenHeader title="Group" onBack={() => navigation.goBack()} />
        <ErrorBanner message={error} />
        <EmptyState
          title="Group unavailable"
          body="It may have been removed."
        />
      </Screen>
    );
  }

  const joinReason = joinBlockedReason(group);
  const leaveReason = leaveBlockedReason(group);

  return (
    <Screen>
      <ScreenHeader title={group.title} onBack={() => navigation.goBack()} />
      <ErrorBanner message={error ?? actionError} />
      <AppText variant="title">{group.title}</AppText>
      <AppText
        variant="subhead"
        color={theme.colors.textSecondary}
        style={{ marginTop: theme.space.xxs }}
      >
        {group.subject}
      </AppText>
      <AppText
        variant="footnote"
        color={theme.colors.textMuted}
        style={{ marginTop: theme.space.xs }}
      >
        {group.memberCount}/{group.maxMembers} members · {group.status}
        {group.location ? ` · ${group.location}` : ''}
      </AppText>
      {group.description ? (
        <AppText variant="body" style={{ marginTop: theme.space.md }}>
          {group.description}
        </AppText>
      ) : null}

      <View
        style={{
          marginTop: theme.space.lg,
          borderTopWidth: hairlineWidth(),
          borderTopColor: theme.colors.divider,
          paddingTop: theme.space.md,
        }}
      >
        <AppText variant="headline">Leader</AppText>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space.sm,
            marginTop: theme.space.sm,
          }}
        >
          <Avatar name={group.leader.name} />
          <AppText variant="callout">{group.leader.name}</AppText>
        </View>
      </View>

      {group.recurringSlots.length > 0 ? (
        <View
          style={{
            marginTop: theme.space.lg,
            borderTopWidth: hairlineWidth(),
            borderTopColor: theme.colors.divider,
            paddingTop: theme.space.md,
          }}
        >
          <AppText variant="headline">Schedule</AppText>
          {group.recurringSlots.map(slot => (
            <AppText
              key={slot.id}
              variant="subhead"
              color={theme.colors.textSecondary}
              style={{ marginTop: theme.space.xs }}
            >
              {formatSlot(slot)}
            </AppText>
          ))}
        </View>
      ) : null}

      {canViewMembers(group) && members ? (
        <View
          style={{
            marginTop: theme.space.lg,
            borderTopWidth: hairlineWidth(),
            borderTopColor: theme.colors.divider,
            paddingTop: theme.space.md,
          }}
        >
          <AppText variant="headline">Members</AppText>
          {members.map(member => (
            <View
              key={member.userId}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.sm,
                paddingVertical: theme.space.sm,
              }}
            >
              <Avatar name={member.name} size={32} />
              <View>
                <AppText variant="callout">{member.name}</AppText>
                <AppText variant="caption" color={theme.colors.textMuted}>
                  {member.role}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {canManageJoinRequests(group) ? (
        <View
          style={{
            marginTop: theme.space.lg,
            borderTopWidth: hairlineWidth(),
            borderTopColor: theme.colors.divider,
            paddingTop: theme.space.md,
          }}
        >
          <AppText variant="headline">Join requests</AppText>
          {requests && requests.length === 0 ? (
            <AppText
              variant="subhead"
              color={theme.colors.textMuted}
              style={{ marginTop: theme.space.xs }}
            >
              No pending requests.
            </AppText>
          ) : null}
          {requests?.map(request => (
            <View
              key={request.id}
              style={{
                paddingVertical: theme.space.md,
                borderBottomWidth: hairlineWidth(),
                borderBottomColor: theme.colors.divider,
              }}
            >
              <AppText variant="callout">{request.requester.name}</AppText>
              <AppText variant="caption" color={theme.colors.textMuted}>
                {request.status}
              </AppText>
              <View
                style={{
                  flexDirection: 'row',
                  gap: theme.space.sm,
                  marginTop: theme.space.sm,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Button
                    label="Approve"
                    onPress={() =>
                      run(() =>
                        groupsApi(client)
                          .approveJoin(group.id, request.id)
                          .then(() => undefined),
                      )
                    }
                    loading={busy}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Decline"
                    tone="secondary"
                    onPress={() =>
                      run(() =>
                        groupsApi(client)
                          .rejectJoin(group.id, request.id)
                          .then(() => undefined),
                      )
                    }
                    loading={busy}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={{ marginTop: theme.space.xl, gap: theme.space.sm }}>
        {canRequestJoin(group) ? (
          <Button
            label="Request to join"
            onPress={() =>
              run(() =>
                groupsApi(client)
                  .requestJoin(group.id)
                  .then(() => undefined),
              )
            }
            loading={busy}
          />
        ) : null}
        {joinReason && !isActiveMember(group) ? (
          <AppText variant="footnote" color={theme.colors.textMuted}>
            {joinReason}
          </AppText>
        ) : null}
        {canLeave(group) ? (
          <Button
            label={
              group.isLeader && group.memberCount === 1
                ? 'Leave and archive'
                : 'Leave group'
            }
            tone="danger"
            onPress={() =>
              run(async () => {
                await groupsApi(client).leave(group.id);
                navigation.navigate('Groups');
              })
            }
            loading={busy}
          />
        ) : null}
        {leaveReason ? (
          <AppText variant="footnote" color={theme.colors.textMuted}>
            {leaveReason}
          </AppText>
        ) : null}
      </View>
    </Screen>
  );
}
