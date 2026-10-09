import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { userFacingMessage } from '../api/errors';
import { useAuth } from '../auth/AuthProvider';
import { validateLogin } from '../auth/validation';
import { ErrorBanner } from '../components/ErrorBanner';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { colors } from '../theme/colors';

export function LoginScreen({ onGoRegister }: { onGoRegister: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const local = validateLogin(email, password);
    if (local) {
      setError(local);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login({ email: email.trim(), password });
    } catch (caught) {
      setError(userFacingMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.brand}>StudySync</Text>
      <Text style={styles.lead}>Sign in to continue</Text>
      <ErrorBanner message={error} />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
      />
      <PrimaryButton label="Log in" onPress={onSubmit} loading={loading} />
      <Pressable onPress={onGoRegister} style={styles.linkWrap}>
        <Text style={styles.link}>Create an account</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  lead: {
    color: colors.muted,
    marginBottom: 16,
    marginTop: 4,
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
