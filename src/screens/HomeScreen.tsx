import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { userFacingMessage } from '../api/errors';
import type { GroupDto, UserProfileDto } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { GroupRow } from '../components/GroupRow';
import { ScreenShell } from '../components/ScreenShell';
import { GroupListSkeleton } from '../components/Skeleton';
import { TextLink } from '../components/TextLink';
import type { AppStackParamList } from '../navigation/types';
import { useTheme } from '../theme';

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

export function HomeScreen({
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'Home'>) {
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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onLogout() {
    setError(null);
    try {
      await logout();
    } catch (caught) {
      setError(userFacingMessage(caught));
    }
  }

  const preview = (groups ?? []).slice(0, 3);

  return (
    <ScreenShell mood="home">
      <SafeAreaView
        style={{ flex: 1 }}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.space.screen,
            paddingBottom: theme.space.xxxl,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor={theme.colors.brand}
              colors={[theme.colors.brand]}
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
              alignItems: 'flex-start',
              marginTop: theme.space.sm,
              marginBottom: theme.space.lg,
            }}
          >
            <AppText variant="caption" color={theme.colors.textMuted}>
              StudySync
            </AppText>
            <TextLink label="Log out" tone="danger" onPress={onLogout} />
          </View>

          {profile ? (
            <View
              style={{
                alignItems: 'flex-start',
                marginBottom: theme.space.xl,
              }}
            >
              <Avatar name={profile.name} size={88} />
              <AppText variant="display" style={{ marginTop: theme.space.md }}>
                Hi, {firstName(profile.name)}
              </AppText>
              <AppText
                variant="subhead"
                color={theme.colors.textSecondary}
                style={{ marginTop: 6 }}
              >
                {profile.major} · {profile.year}
              </AppText>
              <AppText
                variant="footnote"
                color={theme.colors.textMuted}
                style={{ marginTop: 2 }}
              >
                {profile.institution.name}
              </AppText>
            </View>
          ) : null}

          <ErrorBanner message={error} />

          <View style={{ gap: theme.space.sm, marginBottom: theme.space.md }}>
            <Button
              label="Find groups"
              onPress={() => navigation.navigate('Groups')}
            />
            <Button
              label="People"
              tone="secondary"
              onPress={() => navigation.navigate('Friends')}
            />
            <Button
              label="Create a group"
              tone="secondary"
              onPress={() => navigation.navigate('CreateGroup')}
            />
          </View>

          <View
            style={{
              marginTop: theme.space.md,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <AppText
              variant="caption"
              color={theme.colors.textMuted}
              style={{ textTransform: 'uppercase', letterSpacing: 0.9 }}
            >
              Your groups
            </AppText>
            <TextLink
              label="See all"
              onPress={() => navigation.navigate('Groups')}
            />
          </View>

          {loading && !groups ? <GroupListSkeleton /> : null}

          {groups && groups.length === 0 ? (
            <EmptyState
              title="No groups yet"
              body="Create a group or search to find classmates. Join requests wait for a leader to approve."
            />
          ) : null}

          {preview.map((group, index) => (
            <GroupRow
              key={group.id}
              group={group}
              last={index === preview.length - 1}
              onPress={() =>
                navigation.navigate('GroupDetail', { groupId: group.id })
              }
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </ScreenShell>
  );
}
