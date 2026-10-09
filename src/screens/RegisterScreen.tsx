import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { userFacingMessage } from '../api/errors';
import { VALID_YEARS, type YearValue } from '../api/types';
import { useAuth } from '../auth/AuthProvider';
import { toRegisterRequest, validateRegister } from '../auth/validation';
import { ErrorBanner } from '../components/ErrorBanner';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { colors } from '../theme/colors';

export function RegisterScreen({ onGoLogin }: { onGoLogin: () => void }) {
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
      <Text style={styles.brand}>Create account</Text>
      <Text style={styles.lead}>
        Uses the same validation rules as the Rust API.
      </Text>
      <ErrorBanner message={error} />
      <TextField
        label="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextField
        label="Password (8+ characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextField
        label="Institution name"
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
      <Text style={styles.label}>Year</Text>
      <View style={styles.years}>
        {VALID_YEARS.map(option => (
          <Pressable
            key={option}
            onPress={() => setYear(option)}
            style={[styles.chip, year === option ? styles.chipOn : null]}
          >
            <Text
              style={[
                styles.chipText,
                year === option ? styles.chipTextOn : null,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
      <PrimaryButton label="Register" onPress={onSubmit} loading={loading} />
      <Pressable onPress={onGoLogin} style={styles.linkWrap}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  lead: {
    color: colors.muted,
    marginBottom: 12,
    marginTop: 4,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  years: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  chipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
  },
  chipTextOn: {
    color: colors.surface,
    fontWeight: '700',
  },
  linkWrap: {
    marginTop: 16,
    alignItems: 'center',
  },
  link: {
    color: colors.accent,
    fontWeight: '600',
  },
});
