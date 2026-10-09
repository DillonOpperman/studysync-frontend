import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { userFacingMessage } from '../api/errors';
import type { GroupDto, UserProfileDto } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { ErrorBanner } from '../components/ErrorBanner';
import { colors } from '../theme/colors';

export function HomeScreen() {
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
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.brand}>StudySync</Text>
          <Pressable onPress={onLogout} accessibilityRole="button">
            <Text style={styles.logout}>Log out</Text>
          </Pressable>
        </View>
        <ErrorBanner message={error} />
        {profile ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{profile.name}</Text>
            <Text style={styles.meta}>{profile.email}</Text>
            <Text style={styles.meta}>
              {profile.major} · {profile.year}
            </Text>
            <Text style={styles.meta}>{profile.institution.name}</Text>
          </View>
        ) : null}
        <Text style={styles.section}>Your groups</Text>
        {loading && !groups ? (
          <ActivityIndicator color={colors.primary} />
        ) : null}
        {groups && groups.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No groups yet</Text>
            <Text style={styles.emptyBody}>
              You are not a member of any study groups. Matching and group
              creation come in a later frontend phase.
            </Text>
          </View>
        ) : null}
        {groups?.map(group => (
          <View key={group.id} style={styles.card}>
            <Text style={styles.cardTitle}>{group.title}</Text>
            <Text style={styles.meta}>{group.subject}</Text>
            <Text style={styles.meta}>
              {group.memberCount}/{group.maxMembers} members · {group.status}
            </Text>
            {group.description ? (
              <Text style={styles.body}>{group.description}</Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brand: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  logout: {
    color: colors.danger,
    fontWeight: '700',
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    color: colors.muted,
    marginTop: 4,
  },
  body: {
    color: colors.text,
    marginTop: 8,
  },
  empty: {
    backgroundColor: colors.empty,
    borderRadius: 12,
    padding: 20,
  },
  emptyTitle: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptyBody: {
    color: colors.muted,
  },
});
