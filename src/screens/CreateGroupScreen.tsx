import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { View } from 'react-native';

import { userFacingMessage } from '../api/errors';
import { WEEKDAYS } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { ErrorBanner } from '../components/ErrorBanner';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { TextField } from '../components/TextField';
import { groupsApi } from '../features/groups/groupsApi';
import {
  validateCreateGroup,
  type CreateGroupDraft,
  type CreateGroupErrors,
} from '../features/groups/validateCreate';
import type { AppStackParamList } from '../navigation/types';
import { useTheme } from '../theme';

export function CreateGroupScreen({
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'CreateGroup'>) {
  const theme = useTheme();
  const { client, state } = useAuth();
  const profile = state.status === 'signedIn' ? state.user : null;
  const defaultTz = profile?.availability[0]?.timezone ?? 'America/Chicago';
  const [draft, setDraft] = useState<CreateGroupDraft>({
    title: '',
    subject: '',
    description: '',
    location: '',
    maxMembers: '6',
    includeSchedule: false,
    dayOfWeek: 0,
    startTime: '17:00',
    endTime: '21:00',
    timezone: defaultTz,
  });
  const [errors, setErrors] = useState<CreateGroupErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);

  function patch(partial: Partial<CreateGroupDraft>) {
    setDraft(current => ({ ...current, ...partial }));
  }

  async function onSubmit() {
    if (submitting.current) {
      return;
    }
    const result = validateCreateGroup(draft);
    setErrors(result.errors);
    if (!result.request) {
      return;
    }
    submitting.current = true;
    setLoading(true);
    setServerError(null);
    try {
      const group = await groupsApi(client).create(result.request);
      navigation.replace('GroupDetail', { groupId: group.id });
    } catch (caught) {
      setServerError(userFacingMessage(caught));
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader title="New group" onBack={() => navigation.goBack()} />
      <AppText
        variant="footnote"
        color={theme.colors.textMuted}
        style={{ marginBottom: theme.space.sm }}
      >
        Title, subject, and capacity are required. Recurring hours are optional;
        overnight windows (end before start) are allowed.
      </AppText>
      <ErrorBanner message={serverError ?? errors.form ?? null} />
      <TextField
        label="Title"
        value={draft.title}
        error={errors.title}
        onChangeText={title => patch({ title })}
        autoCapitalize="sentences"
      />
      <TextField
        label="Subject"
        value={draft.subject}
        error={errors.subject}
        onChangeText={subject => patch({ subject })}
        autoCapitalize="sentences"
      />
      <TextField
        label="Description"
        value={draft.description}
        onChangeText={description => patch({ description })}
        multiline
      />
      <TextField
        label="Location"
        value={draft.location}
        onChangeText={location => patch({ location })}
      />
      <TextField
        label="Max members (2–50)"
        value={draft.maxMembers}
        error={errors.maxMembers}
        onChangeText={maxMembers => patch({ maxMembers })}
        keyboardType="number-pad"
      />

      <AppText
        variant="footnote"
        color={theme.colors.textSecondary}
        style={{ marginTop: theme.space.lg, marginBottom: theme.space.xs }}
      >
        Weekly meeting (optional)
      </AppText>
      <Chip
        label={
          draft.includeSchedule ? 'Schedule included' : 'Add a weekly slot'
        }
        selected={draft.includeSchedule}
        onPress={() => patch({ includeSchedule: !draft.includeSchedule })}
      />
      {draft.includeSchedule ? (
        <View style={{ marginTop: theme.space.sm }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: theme.space.xs,
            }}
          >
            {WEEKDAYS.map((label, index) => (
              <Chip
                key={label}
                label={label.slice(0, 3)}
                selected={draft.dayOfWeek === index}
                onPress={() => patch({ dayOfWeek: index })}
              />
            ))}
          </View>
          <TextField
            label="Start (HH:MM)"
            value={draft.startTime}
            error={errors.startTime}
            onChangeText={startTime => patch({ startTime })}
          />
          <TextField
            label="End (HH:MM)"
            value={draft.endTime}
            error={errors.endTime}
            hint="Earlier than start is treated as overnight."
            onChangeText={endTime => patch({ endTime })}
          />
          <TextField
            label="IANA timezone"
            value={draft.timezone}
            error={errors.timezone}
            onChangeText={timezone => patch({ timezone })}
            autoCapitalize="none"
          />
        </View>
      ) : null}

      <View style={{ marginTop: theme.space.xl }}>
        <Button
          label="Create group"
          onPress={onSubmit}
          loading={loading}
          disabled={loading}
        />
      </View>
    </Screen>
  );
}
