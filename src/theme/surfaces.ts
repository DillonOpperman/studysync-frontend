import { Platform, type ViewStyle } from 'react-native';

import type { Theme } from './tokens';

export function glassSurface(
  theme: Theme,
  strength: 'soft' | 'strong' = 'soft',
): ViewStyle {
  return {
    backgroundColor:
      strength === 'strong' ? theme.colors.glassStrong : theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassEdge,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: Platform.OS === 'android' ? 3 : 0,
  };
}
