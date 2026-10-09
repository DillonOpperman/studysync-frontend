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
    <Screen>
      <View style={{ marginTop: theme.space.md, marginBottom: theme.space.xl }}>
        <BrandMark compact />
        <AppText variant="title" style={{ marginTop: theme.space.xl }}>
          Welcome back
        </AppText>
        <AppText
          variant="subhead"
          color={theme.colors.textMuted}
          style={{ marginTop: theme.space.xs }}
        >
          Sign in with the email you used to register.
        </AppText>
      </View>
      <ErrorBanner message={error} />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
      />
      <View style={{ marginTop: theme.space.xl }}>
        <Button label="Log in" onPress={onSubmit} loading={loading} />
      </View>
      <View style={{ marginTop: theme.space.md, alignItems: 'center' }}>
        <Button label="Create an account" tone="ghost" onPress={onGoRegister} />
      </View>
    </Screen>
  );
}
