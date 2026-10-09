import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { userFacingMessage } from '../api/errors';
import type { GroupSearchResponse, SearchMode } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { GroupRow } from '../components/GroupRow';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { GroupListSkeleton } from '../components/Skeleton';
import { TextField } from '../components/TextField';
import { TextLink } from '../components/TextLink';
import {
  isSearchCancelled,
  runGroupSearch,
  searchHasMore,
} from '../features/groups/searchSession';
import type { AppStackParamList } from '../navigation/types';
import { useTheme } from '../theme';

export function SearchScreen({
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'Search'>) {
  const theme = useTheme();
  const { client } = useAuth();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('fullText');
  const [result, setResult] = useState<GroupSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastPageCount, setLastPageCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const seq = useRef(0);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounce.current) {
        clearTimeout(debounce.current);
      }
    };
  }, []);

  async function execute(
    nextQuery: string,
    nextMode: SearchMode,
    offset: number,
  ) {
    const trimmed = nextQuery.trim();
    if (!trimmed) {
      abortRef.current?.abort();
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const token = ++seq.current;
    if (offset === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const page = await runGroupSearch(
        client,
        { query: trimmed, mode: nextMode, offset, limit: 20 },
        controller.signal,
      );
      if (token !== seq.current) {
        return;
      }
      setLastPageCount(page.results.length);
      setResult(current =>
        offset === 0 || !current
          ? page
          : {
              ...page,
              results: [...current.results, ...page.results],
            },
      );
    } catch (caught) {
      if (isSearchCancelled(caught) || token !== seq.current) {
        return;
      }
      setError(userFacingMessage(caught));
      if (offset === 0) {
        setResult(null);
        setLastPageCount(0);
      }
    } finally {
      if (token === seq.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }

  function scheduleSearch(nextQuery: string, nextMode: SearchMode) {
    if (debounce.current) {
      clearTimeout(debounce.current);
    }
    debounce.current = setTimeout(() => {
      execute(nextQuery, nextMode, 0);
    }, 400);
  }

  const canLoadMore = Boolean(
    result && !loading && searchHasMore(lastPageCount, result.limit),
  );

  return (
    <Screen mood="search">
      <ScreenHeader title="Search" onBack={() => navigation.goBack()} />
      <AppText
        variant="footnote"
        color={theme.colors.textMuted}
        style={{ marginBottom: theme.space.xs }}
      >
        Full-text uses Postgres. Semantic uses the server embedding model.
      </AppText>
      <TextField
        label="Query"
        hideLabel
        placeholder="Search groups"
        value={query}
        onChangeText={value => {
          setQuery(value);
          scheduleSearch(value, mode);
        }}
        returnKeyType="search"
        onSubmitEditing={() => execute(query, mode, 0)}
        autoCorrect
        autoCapitalize="none"
      />
      <View
        style={{
          flexDirection: 'row',
          gap: theme.space.xs,
          marginTop: theme.space.md,
        }}
      >
        <Chip
          label="Full text"
          selected={mode === 'fullText'}
          onPress={() => {
            setMode('fullText');
            scheduleSearch(query, 'fullText');
          }}
        />
        <Chip
          label="Semantic"
          selected={mode === 'semantic'}
          onPress={() => {
            setMode('semantic');
            scheduleSearch(query, 'semantic');
          }}
        />
      </View>
      <View style={{ marginTop: theme.space.md }}>
        <Button
          label="Search"
          onPress={() => execute(query, mode, 0)}
          loading={loading}
        />
      </View>
      <ErrorBanner message={error} />
      {loading && !result ? <GroupListSkeleton /> : null}
      {result && result.results.length === 0 && !loading ? (
        <EmptyState
          title="No groups found"
          body={`Nothing matched “${result.query}” in ${
            result.mode === 'semantic' ? 'semantic' : 'full-text'
          } search.`}
        />
      ) : null}
      {result?.results.map((row, index) => (
        <GroupRow
          key={`${row.group.id}-${index}`}
          group={row.group}
          last={index === result.results.length - 1}
          caption={`Rank ${row.score.toFixed(3)}`}
          onPress={() =>
            navigation.navigate('GroupDetail', { groupId: row.group.id })
          }
        />
      ))}
      {canLoadMore ? (
        <View style={{ marginTop: theme.space.md, alignItems: 'center' }}>
          <TextLink
            label={loadingMore ? 'Loading…' : 'Load more'}
            onPress={() =>
              result && execute(query, mode, result.offset + result.limit)
            }
          />
        </View>
      ) : null}
    </Screen>
  );
}
