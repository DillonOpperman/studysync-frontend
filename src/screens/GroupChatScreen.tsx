import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { userFacingMessage } from '../api/errors';
import type { GroupDto, GroupMemberDto } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { AppText } from '../components/AppText';
import { ChatComposer } from '../components/ChatComposer';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { MessageBubble } from '../components/MessageBubble';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenShell } from '../components/ScreenShell';
import { TextLink } from '../components/TextLink';
import { chatApi } from '../features/chat/chatApi';
import { newClientMsgId } from '../features/chat/clientMsgId';
import {
  applyReactionState,
  canDeleteMessage,
  canEditMessage,
  type ChatMessage,
  newestId,
  oldestId,
  upsertMessages,
  validateOutgoingContent,
} from '../features/chat/messageStore';
import type { ServerEvent } from '../features/chat/protocol';
import { GroupChatSocket, type SocketStatus } from '../features/chat/wsClient';
import { groupsApi } from '../features/groups/groupsApi';
import { canOpenGroupChat } from '../features/groups/membership';
import type { AppStackParamList } from '../navigation/types';
import { useTheme } from '../theme';

export function GroupChatScreen({
  navigation,
  route,
}: NativeStackScreenProps<AppStackParamList, 'GroupChat'>) {
  const theme = useTheme();
  const { client, state, getAccessToken, refreshAccessToken } = useAuth();
  const userId = state.status === 'signedIn' ? state.user.id : '';
  const { groupId, title } = route.params;
  const [group, setGroup] = useState<GroupDto | null>(null);
  const [members, setMembers] = useState<GroupMemberDto[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [announce, setAnnounce] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<SocketStatus>('idle');
  const socketRef = useRef<GroupChatSocket | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const sendingRef = useRef(false);
  const oldestRef = useRef<string | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const names = useMemo(() => {
    const map = new Map<string, string>();
    for (const member of members) {
      map.set(member.userId, member.name);
    }
    if (group?.leader.id) {
      map.set(group.leader.id, group.leader.name);
    }
    return map;
  }, [members, group]);

  const applyEvent = useCallback(
    (event: ServerEvent) => {
      if (event.op === 'error') {
        setWsError(event.message);
        return;
      }
      if (
        event.op === 'message.created' ||
        event.op === 'message.edited' ||
        event.op === 'message.deleted'
      ) {
        if (event.payload.groupId !== groupId) {
          return;
        }
        setMessages(current => upsertMessages(current, [event.payload]));
      }
      if (
        event.op === 'reaction.updated' &&
        event.payload.groupId === groupId
      ) {
        setMessages(current => applyReactionState(current, event.payload));
      }
    },
    [groupId],
  );

  const recoverNewer = useCallback(async () => {
    const after = newestId(messagesRef.current);
    if (!after) {
      return;
    }
    const page = await chatApi(client).list(groupId, { after, limit: 50 });
    setMessages(current => upsertMessages(current, page.messages));
  }, [client, groupId]);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      setLoading(true);
      setError(null);
      try {
        const nextGroup = await groupsApi(client).get(groupId);
        if (cancelled) {
          return;
        }
        setGroup(nextGroup);
        if (!canOpenGroupChat(nextGroup)) {
          setError(
            nextGroup.status !== 'active'
              ? 'Chat is unavailable for archived groups.'
              : 'Only active members can open this conversation.',
          );
          return;
        }
        const [memberList, page] = await Promise.all([
          groupsApi(client).members(groupId),
          chatApi(client).list(groupId, { limit: 50 }),
        ]);
        if (cancelled) {
          return;
        }
        setMembers(memberList);
        setMessages(upsertMessages([], page.messages));
        setHasMoreOlder(page.pagination.hasMore);
        oldestRef.current = page.pagination.nextBefore;
      } catch (caught) {
        if (!cancelled) {
          setError(userFacingMessage(caught));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [client, groupId]);

  useEffect(() => {
    if (!group || !canOpenGroupChat(group)) {
      return;
    }
    const socket = new GroupChatSocket({
      getAccessToken,
      refreshAccessToken,
    });
    socketRef.current = socket;
    socket.connect(groupId, {
      onEvent: applyEvent,
      onStatus: next => {
        setStatus(next);
        if (next === 'subscribed') {
          recoverNewer().catch(caught => setWsError(userFacingMessage(caught)));
        }
      },
      onAuthFailure: () =>
        setWsError('Your session expired. Sign in again to use live chat.'),
    });
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') {
        socket.resume();
      } else if (next === 'background') {
        socket.pause();
      }
    });
    return () => {
      sub.remove();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    applyEvent,
    getAccessToken,
    group,
    groupId,
    recoverNewer,
    refreshAccessToken,
  ]);

  async function loadOlder() {
    if (loadingOlder || !hasMoreOlder || loading) {
      return;
    }
    const before = oldestRef.current ?? oldestId(messagesRef.current);
    if (!before) {
      return;
    }
    setLoadingOlder(true);
    try {
      const page = await chatApi(client).list(groupId, { before, limit: 50 });
      setMessages(current => upsertMessages(current, page.messages));
      setHasMoreOlder(page.pagination.hasMore);
      oldestRef.current = page.pagination.nextBefore;
    } catch (caught) {
      setError(userFacingMessage(caught));
    } finally {
      setLoadingOlder(false);
    }
  }

  async function onSend() {
    if (sendingRef.current) {
      return;
    }
    if (editingId) {
      const problem = validateOutgoingContent(draft);
      if (problem) {
        setError(problem);
        return;
      }
      sendingRef.current = true;
      setSending(true);
      try {
        const updated = await chatApi(client).edit(editingId, draft.trim());
        setMessages(current => upsertMessages(current, [updated]));
        setEditingId(null);
        setDraft('');
        setError(null);
      } catch (caught) {
        setError(userFacingMessage(caught));
      } finally {
        sendingRef.current = false;
        setSending(false);
      }
      return;
    }
    const problem = validateOutgoingContent(draft);
    if (problem) {
      setError(problem);
      return;
    }
    const content = draft.trim();
    sendingRef.current = true;
    setSending(true);
    let clientMsgId = '';
    try {
      clientMsgId = newClientMsgId();
      const pending: ChatMessage = {
        id: clientMsgId,
        groupId,
        senderId: userId,
        clientMsgId,
        content,
        messageType: announce ? 'announcement' : 'text',
        createdAt: new Date().toISOString(),
        editedAt: null,
        deletedAt: null,
        reactions: [],
        attachments: [],
        pending: true,
      };
      setDraft('');
      setMessages(current => upsertMessages(current, [pending]));
      const socket = socketRef.current;
      const viaSocket =
        socket?.isSubscribed() &&
        socket.sendOp({
          op: 'message.send',
          groupId,
          clientMsgId,
          content,
          messageType: announce ? 'announcement' : 'text',
        });
      if (!viaSocket) {
        const saved = await chatApi(client).send(groupId, {
          clientMsgId,
          content,
          messageType: announce ? 'announcement' : 'text',
        });
        setMessages(current => upsertMessages(current, [saved]));
      } else {
        setTimeout(() => {
          const stillPending = messagesRef.current.find(
            row => row.clientMsgId === clientMsgId && row.pending,
          );
          if (!stillPending) {
            return;
          }
          chatApi(client)
            .send(groupId, {
              clientMsgId,
              content,
              messageType: announce ? 'announcement' : 'text',
            })
            .then(saved =>
              setMessages(current => upsertMessages(current, [saved])),
            )
            .catch(caught => {
              setError(userFacingMessage(caught));
              setMessages(current =>
                current.map(row =>
                  row.clientMsgId === clientMsgId
                    ? { ...row, pending: false, failed: true }
                    : row,
                ),
              );
            });
        }, 6000);
      }
      setError(null);
    } catch (caught) {
      setError(userFacingMessage(caught));
      setDraft(current => current || content);
      setMessages(current =>
        current.map(row =>
          row.clientMsgId === clientMsgId
            ? { ...row, pending: false, failed: true }
            : row,
        ),
      );
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  function requestEdit(message: ChatMessage) {
    setEditingId(message.id);
    setDraft(message.content);
    setAnnounce(message.messageType === 'announcement');
  }

  function requestDelete(message: ChatMessage) {
    Alert.alert('Delete message?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          chatApi(client)
            .remove(message.id)
            .then(updated =>
              setMessages(current => upsertMessages(current, [updated])),
            )
            .catch(caught => setError(userFacingMessage(caught)));
        },
      },
    ]);
  }

  const inverted = [...messages].reverse();
  const headerTitle = group?.title ?? title;
  const live =
    status === 'subscribed'
      ? null
      : status === 'reconnecting' || status === 'connecting'
      ? 'Reconnecting…'
      : status === 'disconnected'
      ? 'Live updates paused'
      : null;

  return (
    <ScreenShell mood="chat">
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={{ paddingHorizontal: theme.space.screen, flex: 1 }}>
            <ScreenHeader
              title={headerTitle}
              onBack={() => navigation.goBack()}
            />
            <ErrorBanner message={error ?? wsError} />
            {live ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: theme.space.sm,
                }}
              >
                <AppText variant="footnote" color={theme.colors.textMuted}>
                  {live}
                </AppText>
                {status === 'disconnected' ? (
                  <TextLink
                    label="Retry"
                    onPress={() => socketRef.current?.resume()}
                  />
                ) : null}
              </View>
            ) : null}

            {loading ? (
              <ActivityIndicator color={theme.colors.accent} />
            ) : messages.length === 0 ? (
              <EmptyState
                title="No messages yet"
                body="Say hello. History is stored on the server and syncs over the live connection."
              />
            ) : (
              <FlatList
                data={inverted}
                inverted
                keyExtractor={item => item.id}
                onEndReached={loadOlder}
                onEndReachedThreshold={0.2}
                keyboardShouldPersistTaps="handled"
                ListFooterComponent={
                  loadingOlder ? (
                    <ActivityIndicator color={theme.colors.accent} />
                  ) : undefined
                }
                renderItem={({ item }) => (
                  <MessageBubble
                    message={item}
                    mine={item.senderId === userId}
                    senderName={
                      names.get(item.senderId) ??
                      (item.senderId === userId ? 'You' : 'Member')
                    }
                    canEdit={canEditMessage(item, userId)}
                    canDelete={canDeleteMessage(
                      item,
                      userId,
                      Boolean(group?.isLeader),
                    )}
                    onEdit={() => requestEdit(item)}
                    onDelete={() => requestDelete(item)}
                    onReact={emoji => {
                      chatApi(client)
                        .toggleReaction(item.id, emoji)
                        .then(stateDto =>
                          setMessages(current =>
                            applyReactionState(current, stateDto),
                          ),
                        )
                        .catch(caught => setError(userFacingMessage(caught)));
                    }}
                  />
                )}
              />
            )}

            {group && canOpenGroupChat(group) ? (
              <ChatComposer
                value={draft}
                onChangeText={setDraft}
                onSend={onSend}
                sending={sending}
                canAnnounce={Boolean(group.isLeader) && !editingId}
                announce={announce}
                onToggleAnnounce={() => setAnnounce(value => !value)}
                disabled={false}
              />
            ) : null}
            {editingId ? (
              <TextLink
                label="Cancel edit"
                onPress={() => {
                  setEditingId(null);
                  setDraft('');
                }}
              />
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenShell>
  );
}
