import React, { useState } from 'react';
import { View } from 'react-native';

import { userFacingMessage } from '../api/errors';
import { useAuth } from '../auth/AuthProvider';
import { validateLogin } from '../auth/validation';
import { AppText } from '../components/AppText';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { ErrorBanner } from '../components/ErrorBanner';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { useTheme } from '../theme';

export function LoginScreen({ onGoRegister }: { onGoRegister: () => void }) {
  const theme = useTheme();
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
    <Screen center mood="auth">
      <View style={{ alignItems: 'center', marginBottom: theme.space.xl }}>
        <BrandMark align="center" />
        <AppText
          variant="subhead"
          color={theme.colors.textMuted}
          style={{ marginTop: theme.space.sm, textAlign: 'center' }}
        >
          Sign in to find your people.
        </AppText>
      </View>
      <ErrorBanner message={error} />
      <TextField
        label="Email"
        hideLabel
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <View
        style={{
          marginTop: theme.space.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <TextField
            label="Password"
            hideLabel
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
          />
        </View>
        <Button
          label="Go"
          round
          onPress={onSubmit}
          loading={loading}
          accessibilityLabel="Log in"
        />
      </View>
      <View style={{ marginTop: theme.space.lg, alignItems: 'center' }}>
        <Button label="Create an account" tone="ghost" onPress={onGoRegister} />
      </View>
    </Screen>
  );
}
