import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, View } from 'react-native';

import { userFacingMessage } from '../api/errors';
import type {
  FriendListDto,
  FriendRequestDto,
  FriendRequestListDto,
  MessageRequestDto,
} from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { SectionLabel } from '../components/SectionLabel';
import { GroupListSkeleton } from '../components/Skeleton';
import { TextField } from '../components/TextField';
import { TextLink } from '../components/TextLink';
import { dmApi } from '../features/social/dmApi';
import { friendsApi } from '../features/social/friendsApi';
import { isUserId, normalizeUserId } from '../features/social/userId';
import type { AppStackParamList } from '../navigation/types';
import { useTheme } from '../theme';

export function FriendsScreen({
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'Friends'>) {
  const theme = useTheme();
  const { client, state } = useAuth();
  const selfId = state.status === 'signedIn' ? state.user.id : '';
  const [friends, setFriends] = useState<FriendListDto[] | null>(null);
  const [requests, setRequests] = useState<FriendRequestListDto | null>(null);
  const [messageRequests, setMessageRequests] = useState<
    MessageRequestDto[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [inviteId, setInviteId] = useState('');
  const [blockId, setBlockId] = useState('');
  const busyRef = useRef(false);

  const load = useCallback(async () => {
    const social = friendsApi(client);
    const messages = dmApi(client);
    setError(null);
    try {
      const [nextFriends, nextRequests, nextMessages] = await Promise.all([
        social.list(),
        social.listRequests(),
        messages.listMessageRequests(),
      ]);
      setFriends(nextFriends);
      setRequests(nextRequests);
      setMessageRequests(nextMessages);
    } catch (caught) {
      setError(userFacingMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [client]);

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
    setError(null);
    try {
      await action();
      await load();
    } catch (caught) {
      setError(userFacingMessage(caught));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function confirmBlock(userId: string, name?: string) {
    Alert.alert(
      'Block this person?',
      name
        ? `You will not be able to send friend requests or messages to ${name}.`
        : 'You will not be able to send friend requests or messages to this person.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => run(() => friendsApi(client).block(userId)),
        },
      ],
    );
  }

  const incoming =
    requests?.incoming.filter(row => row.status === 'pending') ?? [];
  const outgoing =
    requests?.outgoing.filter(row => row.status === 'pending') ?? [];
  const pendingMessages =
    messageRequests?.filter(row => row.status === 'pending') ?? [];

  return (
    <Screen mood="home">
      <ScreenHeader title="People" onBack={() => navigation.goBack()} />
      <AppText
        variant="footnote"
        color={theme.colors.textMuted}
        style={{ marginBottom: theme.space.md }}
      >
        There is no people search in the API. Add friends with a user id, or
        from a group member. The server does not list blocked users; unblock
        with their id.
      </AppText>
      <ErrorBanner message={error} />
      {loading ? <GroupListSkeleton /> : null}

      <SectionLabel first>Incoming friend requests</SectionLabel>
      {!loading && incoming.length === 0 ? (
        <EmptyState
          title="No incoming requests"
          body="When someone asks to be friends, they will appear here."
        />
      ) : null}
      {incoming.map(request => (
        <RequestRow
          key={request.id}
          request={request}
          selfId={selfId}
          busy={busy}
          onAccept={() =>
            run(() =>
              friendsApi(client)
                .acceptRequest(request.id)
                .then(() => undefined),
            )
          }
          onReject={() =>
            run(() =>
              friendsApi(client)
                .rejectRequest(request.id)
                .then(() => undefined),
            )
          }
        />
      ))}

      <SectionLabel>Outgoing requests</SectionLabel>
      {!loading && outgoing.length === 0 ? (
        <AppText variant="subhead" color={theme.colors.textMuted}>
          No pending outgoing requests. The API does not support cancelling
          them.
        </AppText>
      ) : null}
      {outgoing.map(request => (
        <AppText
          key={request.id}
          variant="callout"
          style={{ marginBottom: theme.space.sm }}
        >
          Waiting on {peerName(request, selfId)}
        </AppText>
      ))}

      <SectionLabel>Friends</SectionLabel>
      {!loading && (friends ?? []).length === 0 ? (
        <EmptyState
          title="No friends yet"
          body="Accept a request or send one with a user id."
        />
      ) : null}
      {(friends ?? []).map(row => (
        <View
          key={row.user.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space.sm,
            marginBottom: theme.space.sm,
          }}
        >
          <Avatar name={row.user.name} size={40} />
          <View style={{ flex: 1 }}>
            <AppText variant="callout">{row.user.name}</AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Friends since {row.friendsSince.slice(0, 10)}
            </AppText>
          </View>
          <TextLink
            label="Message"
            onPress={() =>
              navigation.navigate('DirectChat', {
                userId: row.user.id,
                name: row.user.name,
              })
            }
          />
          <TextLink
            label="Block"
            tone="danger"
            onPress={() => confirmBlock(row.user.id, row.user.name)}
          />
        </View>
      ))}

      <SectionLabel>Message requests</SectionLabel>
      {!loading && pendingMessages.length === 0 ? (
        <EmptyState
          title="No message requests"
          body="If a group leader receives a first message from a stranger, it lands here instead of in chat."
        />
      ) : null}
      {pendingMessages.map(request => (
        <View key={request.id} style={{ marginBottom: theme.space.md }}>
          <AppText variant="callout">{request.sender.name}</AppText>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Wants to send you a direct message
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
                label="Accept"
                loading={busy}
                onPress={() =>
                  run(async () => {
                    await dmApi(client).acceptMessageRequest(request.id);
                    navigation.navigate('DirectChat', {
                      userId: request.sender.id,
                      name: request.sender.name,
                    });
                  })
                }
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Decline"
                tone="secondary"
                loading={busy}
                onPress={() =>
                  run(() =>
                    dmApi(client)
                      .rejectMessageRequest(request.id)
                      .then(() => undefined),
                  )
                }
              />
            </View>
          </View>
        </View>
      ))}

      <SectionLabel>Add a friend</SectionLabel>
      <TextField
        label="User id"
        hideLabel
        placeholder="User id"
        value={inviteId}
        onChangeText={setInviteId}
        autoCapitalize="none"
      />
      <View style={{ marginTop: theme.space.sm }}>
        <Button
          label="Send friend request"
          loading={busy}
          onPress={() => {
            if (!isUserId(inviteId)) {
              setError('Enter a valid user id.');
              return;
            }
            const userId = normalizeUserId(inviteId);
            if (userId === selfId.toLowerCase()) {
              setError('You cannot send a friend request to yourself.');
              return;
            }
            run(async () => {
              await friendsApi(client).sendRequest(userId);
              setInviteId('');
            });
          }}
        />
      </View>

      <SectionLabel>Block or unblock</SectionLabel>
      <TextField
        label="User id to block or unblock"
        hideLabel
        placeholder="User id to block or unblock"
        value={blockId}
        onChangeText={setBlockId}
        autoCapitalize="none"
      />
      <View
        style={{
          marginTop: theme.space.sm,
          flexDirection: 'row',
          gap: theme.space.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <Button
            label="Block"
            tone="danger"
            loading={busy}
            onPress={() => {
              if (!isUserId(blockId)) {
                setError('Enter a valid user id.');
                return;
              }
              confirmBlock(normalizeUserId(blockId));
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="Unblock"
            tone="secondary"
            loading={busy}
            onPress={() => {
              if (!isUserId(blockId)) {
                setError('Enter a valid user id.');
                return;
              }
              run(async () => {
                await friendsApi(client).unblock(normalizeUserId(blockId));
                setBlockId('');
              });
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

function peerName(request: FriendRequestDto, selfId: string): string {
  return request.requester.id === selfId
    ? request.recipient.name
    : request.requester.name;
}

function RequestRow({
  request,
  selfId,
  busy,
  onAccept,
  onReject,
}: {
  request: FriendRequestDto;
  selfId: string;
  busy: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const theme = useTheme();
  const person = peerName(request, selfId);
  return (
    <View style={{ marginBottom: theme.space.md }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space.sm,
        }}
      >
        <Avatar name={person} size={40} />
        <AppText variant="callout">{person}</AppText>
      </View>
      <View
        style={{
          flexDirection: 'row',
          gap: theme.space.sm,
          marginTop: theme.space.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <Button label="Accept" loading={busy} onPress={onAccept} />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="Decline"
            tone="secondary"
            loading={busy}
            onPress={onReject}
          />
        </View>
      </View>
    </View>
  );
}
