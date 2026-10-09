import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { userFacingMessage } from '../api/errors';
import type { GroupDto, RecommendedGroupDto } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { GroupRow } from '../components/GroupRow';
import { ScreenHeader } from '../components/ScreenHeader';
import { TextLink } from '../components/TextLink';
import { ScreenShell } from '../components/ScreenShell';
import { SectionLabel } from '../components/SectionLabel';
import { GroupListSkeleton } from '../components/Skeleton';
import { groupsApi } from '../features/groups/groupsApi';
import type { AppStackParamList } from '../navigation/types';
import { useTheme } from '../theme';

function factorCaption(row: RecommendedGroupDto): string {
  return `Score ${row.score.toFixed(2)} · subject ${row.groupSubject.toFixed(
    2,
  )} · leader ${row.leaderSubjectSimilarity.toFixed(
    2,
  )} · schedule ${row.scheduleOverlap.toFixed(
    2,
  )} · size ${row.sizeMatch.toFixed(2)}`;
}

export function GroupsScreen({
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'Groups'>) {
  const theme = useTheme();
  const { client } = useAuth();
  const [mine, setMine] = useState<GroupDto[] | null>(null);
  const [recs, setRecs] = useState<RecommendedGroupDto[] | null>(null);
  const [createNew, setCreateNew] = useState(false);
  const [formula, setFormula] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recommendError, setRecommendError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setRecommendError(null);
    const api = groupsApi(client);
    try {
      const groups = await api.listMine();
      setMine(groups);
    } catch (caught) {
      setError(userFacingMessage(caught));
    }
    try {
      const recommend = await api.recommend();
      setRecs(recommend.groups);
      setCreateNew(recommend.createNew);
      setFormula(recommend.formula);
    } catch (caught) {
      setRecommendError(userFacingMessage(caught));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [client]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const memberships = (mine ?? []).filter(
    group =>
      group.membershipStatus === 'leader' ||
      group.membershipStatus === 'member',
  );

  return (
    <ScreenShell mood="groups">
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
              tintColor={theme.colors.cream}
              colors={[theme.colors.cream]}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
        >
          <ScreenHeader
            title="Groups"
            onBack={() => navigation.goBack()}
            action={
              <TextLink
                label="Create"
                onPress={() => navigation.navigate('CreateGroup')}
              />
            }
          />
          <ErrorBanner message={error} />
          <ErrorBanner message={recommendError} />

          <Button
            label="Search groups"
            tone="secondary"
            onPress={() => navigation.navigate('Search')}
          />

          <SectionLabel>Your groups</SectionLabel>
          {loading && !mine ? <GroupListSkeleton /> : null}
          {mine && memberships.length === 0 ? (
            <EmptyState
              title="No memberships yet"
              body="Create a group or search to find one. Join requests stay pending until a leader approves them."
            />
          ) : null}
          {memberships.map((group, index) => (
            <GroupRow
              key={group.id}
              group={group}
              last={index === memberships.length - 1}
              onPress={() =>
                navigation.navigate('GroupDetail', { groupId: group.id })
              }
            />
          ))}

          <SectionLabel>For you</SectionLabel>
          <AppText
            variant="footnote"
            color={theme.colors.textMuted}
            style={{ marginBottom: theme.space.xs }}
          >
            Personalized matches from the API. Groups you already lead, belong
            to, or have requested are excluded server-side.
          </AppText>
          {loading && !recs ? <GroupListSkeleton /> : null}
          {recs && recs.length === 0 ? (
            <EmptyState
              title={createNew ? 'No strong matches' : 'No recommendations'}
              body={
                createNew
                  ? 'Nothing passed the matching threshold. You can create a group instead.'
                  : 'There are no compatible groups to show right now.'
              }
            />
          ) : null}
          {recs?.map((row, index) => (
            <GroupRow
              key={row.group.id}
              group={row.group}
              last={index === recs.length - 1}
              caption={factorCaption(row)}
              onPress={() =>
                navigation.navigate('GroupDetail', { groupId: row.group.id })
              }
            />
          ))}
          {formula ? (
            <AppText
              variant="caption"
              color={theme.colors.textMuted}
              style={{ marginTop: theme.space.md }}
            >
              {formula}
            </AppText>
          ) : null}

          {createNew ? (
            <View style={{ marginTop: theme.space.lg }}>
              <Button
                label="Create a group"
                onPress={() => navigation.navigate('CreateGroup')}
              />
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ScreenShell>
  );
}
