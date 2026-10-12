import { useFocusEffect } from '@react-navigation/native';
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
import { InkWriteText } from '../components/InkWriteText';
import { PressScale } from '../components/PressScale';
import { ScreenShell } from '../components/ScreenShell';
import { GroupListSkeleton } from '../components/Skeleton';
import { TextLink } from '../components/TextLink';
import { useNotifications } from '../features/notifications/NotificationsProvider';
import type { HomeDeskScreenProps } from '../navigation/types';
import { useTheme } from '../theme';

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

export function HomeScreen({ navigation }: HomeDeskScreenProps<'Desk'>) {
  const theme = useTheme();
  const { state, logout, refreshProfile, loadGroups } = useAuth();
  const { badge, refreshUnread } = useNotifications();
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
        refreshUnread(),
      ]);
      setProfile(nextProfile);
      setGroups(nextGroups);
    } catch (caught) {
      setError(userFacingMessage(caught));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadGroups, refreshProfile, refreshUnread]);

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
    <ScreenShell mood="home" showPaper={false}>
      <SafeAreaView
        style={{ flex: 1 }}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.space.screen,
            paddingBottom: theme.space.xl,
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
              marginTop: theme.space.xs,
              marginBottom: theme.space.sm,
            }}
          >
            <AppText variant="caption" color={theme.colors.textMuted}>
              StudySync
            </AppText>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.sm,
              }}
            >
              <PressScale
                accessibilityRole="button"
                accessibilityLabel={
                  badge.label ? `Alerts, ${badge.label} unread` : 'Alerts'
                }
                onPress={() => navigation.navigate('Notifications')}
                style={{
                  minHeight: 44,
                  minWidth: 44,
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                }}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <AppText
                    variant="callout"
                    color={theme.colors.brand}
                    style={{ fontWeight: '600' }}
                  >
                    Alerts
                  </AppText>
                  {badge.label ? (
                    <View
                      style={{
                        minWidth: 22,
                        height: 22,
                        paddingHorizontal: 6,
                        borderRadius: 11,
                        backgroundColor: theme.colors.accentSoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AppText
                        variant="caption"
                        color={theme.colors.accent}
                        style={{ fontWeight: '700' }}
                      >
                        {badge.label}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              </PressScale>
              <TextLink label="Log out" tone="danger" onPress={onLogout} />
            </View>
          </View>

          {profile ? (
            <View
              style={{
                alignItems: 'flex-start',
                marginBottom: theme.space.md,
              }}
            >
              <Avatar name={profile.name} size={80} />
              <View style={{ marginTop: theme.space.xs }}>
                <InkWriteText
                  playKey={`home-hi-${profile.id}`}
                  variant="display"
                  text={`Hi, ${firstName(profile.name)}`}
                />
              </View>
              <AppText
                variant="subhead"
                color={theme.colors.textSecondary}
                style={{ marginTop: 4 }}
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

          <View style={{ gap: theme.space.xs, marginBottom: theme.space.sm }}>
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
              marginTop: theme.space.xs,
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
