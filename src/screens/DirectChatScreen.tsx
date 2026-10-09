import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { userFacingMessage } from '../api/errors';
import { MAX_DIRECT_MESSAGE_CHARS, type DirectMessageDto } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { AppText } from '../components/AppText';
import { ChatComposer } from '../components/ChatComposer';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { Glass } from '../components/Glass';
import { ScreenHeader } from '../components/ScreenHeader';
import { ScreenShell } from '../components/ScreenShell';
import { TextLink } from '../components/TextLink';
import { validateOutgoingContent } from '../features/chat/messageStore';
import { dmApi } from '../features/social/dmApi';
import {
  oldestDirectId,
  upsertDirectMessages,
} from '../features/social/dmStore';
import { friendsApi } from '../features/social/friendsApi';
import type { AppStackParamList } from '../navigation/types';
import { useTheme } from '../theme';

export function DirectChatScreen({
  navigation,
  route,
}: NativeStackScreenProps<AppStackParamList, 'DirectChat'>) {
  const theme = useTheme();
  const { client, state } = useAuth();
  const selfId = state.status === 'signedIn' ? state.user.id : '';
  const { userId, name } = route.params;
  const [messages, setMessages] = useState<DirectMessageDto[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const oldestRef = useRef<string | null>(null);
  const seq = useRef(0);

  const load = useCallback(async () => {
    const token = ++seq.current;
    setError(null);
    try {
      const page = await dmApi(client).list(userId, { limit: 50 });
      if (token !== seq.current) {
        return;
      }
      setMessages(page);
      setHasMoreOlder(page.length >= 50);
      oldestRef.current = oldestDirectId(page);
    } catch (caught) {
      if (token !== seq.current) {
        return;
      }
      setError(userFacingMessage(caught));
      setMessages([]);
    } finally {
      if (token === seq.current) {
        setLoading(false);
      }
    }
  }, [client, userId]);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {
        seq.current += 1;
      };
    }, [load]),
  );

  async function loadOlder() {
    if (loadingOlder || !hasMoreOlder || loading) {
      return;
    }
    const before = oldestRef.current ?? oldestDirectId(messages);
    if (!before) {
      return;
    }
    setLoadingOlder(true);
    try {
      const page = await dmApi(client).list(userId, { before, limit: 50 });
      setMessages(current => {
        const next = upsertDirectMessages(current, page);
        oldestRef.current = oldestDirectId(next);
        return next;
      });
      setHasMoreOlder(page.length >= 50);
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
    const problem = validateOutgoingContent(draft);
    if (problem) {
      setError(problem);
      return;
    }
    const content = draft.trim();
    sendingRef.current = true;
    setSending(true);
    setError(null);
    try {
      const result = await dmApi(client).send({
        recipientId: userId,
        content,
        messageType: 'text',
      });
      setDraft('');
      if (result.kind === 'directMessage') {
        setNotice(null);
        setMessages(current => upsertDirectMessages(current, [result.message]));
      } else {
        const pending =
          result.status === 202
            ? 'Message request sent. It is not a delivered direct message until they accept.'
            : 'A message request is already pending. This was not delivered as a chat message.';
        setNotice(pending);
      }
    } catch (caught) {
      setError(userFacingMessage(caught));
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  const inverted = [...messages].reverse();

  return (
    <ScreenShell mood="chat">
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={{ paddingHorizontal: theme.space.screen, flex: 1 }}>
            <ScreenHeader
              title={name}
              onBack={() => navigation.goBack()}
              action={
                <TextLink
                  label="Block"
                  tone="danger"
                  onPress={() =>
                    Alert.alert(
                      'Block this person?',
                      `You will not be able to message ${name}.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Block',
                          style: 'destructive',
                          onPress: () => {
                            friendsApi(client)
                              .block(userId)
                              .then(() => navigation.goBack())
                              .catch(caught =>
                                setError(userFacingMessage(caught)),
                              );
                          },
                        },
                      ],
                    )
                  }
                />
              }
            />
            <AppText
              variant="caption"
              color={theme.colors.textMuted}
              style={{ marginBottom: theme.space.sm }}
            >
              Direct message · REST
            </AppText>
            <ErrorBanner message={error} />
            {notice ? (
              <AppText
                variant="footnote"
                color={theme.colors.textSecondary}
                style={{ marginBottom: theme.space.sm }}
              >
                {notice}
              </AppText>
            ) : null}

            {loading ? (
              <ActivityIndicator color={theme.colors.brand} />
            ) : messages.length === 0 ? (
              <EmptyState
                title="No messages yet"
                body="History is stored on the server. Friends, shared groups, or an accepted message request can write here."
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
                    <ActivityIndicator color={theme.colors.brand} />
                  ) : undefined
                }
                renderItem={({ item }) => (
                  <DirectBubble
                    message={item}
                    mine={item.senderId === selfId}
                  />
                )}
              />
            )}

            <ChatComposer
              value={draft}
              onChangeText={setDraft}
              onSend={onSend}
              sending={sending}
              canAnnounce={false}
              announce={false}
              onToggleAnnounce={() => undefined}
              disabled={false}
              maxLength={MAX_DIRECT_MESSAGE_CHARS}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenShell>
  );
}

function DirectBubble({
  message,
  mine,
}: {
  message: DirectMessageDto;
  mine: boolean;
}) {
  const theme = useTheme();
  const time = new Date(message.createdAt);
  const stamp = Number.isNaN(time.getTime())
    ? ''
    : time.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
  return (
    <View
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        maxWidth: '84%',
        marginVertical: 5,
      }}
    >
      <Glass
        intensity={mine ? 'action' : 'strong'}
        radius={theme.radius.md}
        style={{ marginTop: 2 }}
      >
        <View style={{ paddingVertical: 11, paddingHorizontal: 16 }}>
          <AppText variant="body" color={theme.colors.onGlass}>
            {message.content}
          </AppText>
        </View>
      </Glass>
      <AppText
        variant="caption"
        color={theme.colors.textMuted}
        style={{ marginTop: 4, letterSpacing: 0, fontWeight: '400' }}
      >
        {stamp}
      </AppText>
    </View>
  );
}
