import React, { useState } from 'react';
import { View } from 'react-native';

import { userFacingMessage } from '../api/errors';
import { VALID_YEARS, type YearValue } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { toRegisterRequest, validateRegister } from '../auth/validation';
import { AppText } from '../components/AppText';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { ErrorBanner } from '../components/ErrorBanner';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { useTheme } from '../theme';

export function RegisterScreen({ onGoLogin }: { onGoLogin: () => void }) {
  const theme = useTheme();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState<YearValue>('Junior');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const draft = { name, email, password, institutionName, major, year };
    const local = validateRegister(draft);
    if (local) {
      setError(local);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(toRegisterRequest(draft));
    } catch (caught) {
      setError(userFacingMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ marginTop: theme.space.md, marginBottom: theme.space.lg }}>
        <BrandMark compact />
        <AppText variant="title" style={{ marginTop: theme.space.xl }}>
          Join StudySync
        </AppText>
        <AppText
          variant="body"
          color={theme.colors.textMuted}
          style={{ marginTop: theme.space.sm }}
        >
          A few details from campus. Passwords must be at least 8 characters.
        </AppText>
      </View>
      <ErrorBanner message={error} />
      <TextField
        label="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        textContentType="name"
      />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        label="Password"
        hint="8–128 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="newPassword"
      />
      <TextField
        label="Institution"
        value={institutionName}
        onChangeText={setInstitutionName}
        autoCapitalize="words"
      />
      <TextField
        label="Major"
        value={major}
        onChangeText={setMajor}
        autoCapitalize="words"
      />
      <AppText
        variant="footnote"
        color={theme.colors.textSecondary}
        style={{ marginTop: theme.space.md, marginBottom: theme.space.xs }}
      >
        Year
      </AppText>
      <View
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.xs }}
      >
        {VALID_YEARS.map(option => (
          <Chip
            key={option}
            label={option}
            selected={year === option}
            onPress={() => setYear(option)}
          />
        ))}
      </View>
      <View style={{ marginTop: theme.space.xl }}>
        <Button label="Create account" onPress={onSubmit} loading={loading} />
      </View>
      <View style={{ marginTop: theme.space.sm, alignItems: 'center' }}>
        <Button
          label="I already have an account"
          tone="ghost"
          onPress={onGoLogin}
        />
      </View>
    </Screen>
  );
}
