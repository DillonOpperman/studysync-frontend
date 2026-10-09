import React, { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';

export function TextField({
  label,
  error,
  hint,
  ...rest
}: TextInputProps & { label: string; error?: string; hint?: string }) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const border = error
    ? theme.colors.danger
    : focused
    ? theme.colors.accent
    : theme.colors.border;

  return (
    <View style={{ marginTop: theme.space.md }}>
      <AppText
        variant="footnote"
        color={theme.colors.textSecondary}
        style={{ marginBottom: theme.space.xxs }}
      >
        {label}
      </AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
        onFocus={event => {
          setFocused(true);
          rest.onFocus?.(event);
        }}
        onBlur={event => {
          setFocused(false);
          rest.onBlur?.(event);
        }}
        style={[
          styles.input,
          {
            minHeight: theme.control.minHeight,
            borderRadius: theme.radius.md,
            borderColor: border,
            borderWidth: focused || error ? 1.5 : theme.control.hairline,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            paddingHorizontal: theme.space.md,
            ...theme.type.callout,
          },
          rest.style,
        ]}
      />
      {error ? (
        <AppText
          variant="footnote"
          color={theme.colors.danger}
          style={{ marginTop: theme.space.xxs }}
        >
          {error}
        </AppText>
      ) : hint ? (
        <AppText
          variant="caption"
          color={theme.colors.textMuted}
          style={{ marginTop: theme.space.xxs }}
        >
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    paddingVertical: 12,
  },
});
