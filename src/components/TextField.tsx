import React, { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Glass } from './Glass';

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
      <Glass intensity={focused ? 'strong' : 'soft'} radius={theme.radius.pill}>
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
            {
              minHeight: theme.control.minHeight,
              color: theme.colors.onGlass,
              paddingHorizontal: theme.space.lg,
              ...theme.type.callout,
            },
            rest.style,
          ]}
        />
      </Glass>
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
    backgroundColor: 'transparent',
  },
});
