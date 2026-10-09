import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { userFacingMessage } from '../api/errors';
import type { GroupDto, UserProfileDto } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { TextLink } from '../components/TextLink';
import { ErrorBanner } from '../components/ErrorBanner';
import { GroupListSkeleton } from '../components/Skeleton';
import { GroupRow } from '../components/GroupRow';
import { hairlineWidth, useTheme } from '../theme';

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

export function HomeScreen() {
  const theme = useTheme();
  const { state, logout, refreshProfile, loadGroups } = useAuth();
  const user = state.status === 'signedIn' ? state.user : null;
  const [groups, setGroups] = useState<GroupDto[] | null>(null);
  const [profile, setProfile] = useState<UserProfileDto | null>(user);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [nextProfile, nextGroups] = await Promise.all([
        refreshProfile(),
        loadGroups(),
      ]);
      setProfile(nextProfile);
      setGroups(nextGroups);
    } catch (caught) {
      setError(userFacingMessage(caught));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadGroups, refreshProfile]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function onLogout() {
    setError(null);
    try {
      await logout();
    } catch (caught) {
      setError(userFacingMessage(caught));
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.canvas }}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.space.xl,
          paddingBottom: theme.space.xxxl,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={theme.colors.accent}
            colors={[theme.colors.accent]}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: theme.space.sm,
            marginBottom: theme.space.lg,
          }}
        >
          <AppText variant="footnote" color={theme.colors.textMuted}>
            StudySync
          </AppText>
          <TextLink label="Log out" tone="danger" onPress={onLogout} />
        </View>

        {profile ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.space.md,
              marginBottom: theme.space.xl,
            }}
          >
            <Avatar name={profile.name} size={52} />
            <View style={{ flex: 1 }}>
              <AppText variant="title">Hi, {firstName(profile.name)}</AppText>
              <AppText
                variant="subhead"
                color={theme.colors.textSecondary}
                style={{ marginTop: 2 }}
              >
                {profile.major} · {profile.year}
              </AppText>
              <AppText variant="footnote" color={theme.colors.textMuted}>
                {profile.institution.name}
              </AppText>
            </View>
          </View>
        ) : null}

        <ErrorBanner message={error} />

        <View
          style={{
            borderTopWidth: hairlineWidth(),
            borderTopColor: theme.colors.divider,
            paddingTop: theme.space.md,
          }}
        >
          <AppText variant="headline">Groups</AppText>
          {groups && groups.length > 0 ? (
            <AppText
              variant="footnote"
              color={theme.colors.textMuted}
              style={{ marginTop: 2 }}
            >
              {groups.length} {groups.length === 1 ? 'group' : 'groups'}
            </AppText>
          ) : null}
        </View>

        {loading && !groups ? <GroupListSkeleton /> : null}

        {groups && groups.length === 0 ? (
          <EmptyState
            title="No groups yet"
            body="When you join or create a study group, it will show up here. Matching and group creation are coming in a later update."
          />
        ) : null}

        {groups?.map((group, index) => (
          <GroupRow
            key={group.id}
            group={group}
            last={index === groups.length - 1}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
