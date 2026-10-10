import { Platform, type ViewStyle } from 'react-native';

import type { Theme } from './tokens';

export function glassSurface(
  theme: Theme,
  strength: 'soft' | 'strong' | 'action' = 'soft',
): ViewStyle {
  const fill =
    strength === 'action' || strength === 'strong'
      ? theme.colors.glassStrong
      : theme.colors.glass;
  return {
    backgroundColor: fill,
    borderWidth: 1,
    borderColor:
      strength === 'action'
        ? 'rgba(255, 252, 246, 0.34)'
        : theme.colors.glassEdge,
    shadowColor: theme.colors.shadow,
    shadowOpacity: strength === 'action' ? 0.08 : 0.1,
    shadowRadius: strength === 'action' ? 16 : 20,
    shadowOffset: { width: 0, height: strength === 'action' ? 6 : 8 },
    elevation: Platform.OS === 'android' ? 2 : 0,
  };
}
