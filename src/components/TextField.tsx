import React, { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { glassSurface, useTheme } from '../theme';

import { AppText } from './AppText';

export function TextField({
  label,
  error,
  hint,
  hideLabel,
  ...rest
}: TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
}) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const glass = glassSurface(theme, focused ? 'strong' : 'soft');
  const border = error
    ? theme.colors.danger
    : focused
    ? 'rgba(255,255,255,0.95)'
    : theme.colors.glassEdge;

  return (
    <View style={{ marginTop: hideLabel ? 0 : theme.space.md }}>
      {hideLabel ? null : (
        <AppText
          variant="caption"
          color={theme.colors.textMuted}
          style={{
            marginBottom: theme.space.xs,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          {label}
        </AppText>
      )}
      <TextInput
        accessibilityLabel={label}
        placeholder={rest.placeholder ?? (hideLabel ? label : undefined)}
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
          glass,
          {
            minHeight: theme.control.minHeight,
            borderRadius: theme.radius.pill,
            borderColor: border,
            borderWidth: 1,
            backgroundColor: glass.backgroundColor,
            color: theme.colors.onGlass,
            paddingHorizontal: theme.space.lg,
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
          style={{ marginTop: theme.space.xxs, letterSpacing: 0 }}
        >
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    paddingVertical: 14,
  },
});
