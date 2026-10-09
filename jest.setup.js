jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
  },
  setGenericPassword: jest.fn(async () => true),
  getGenericPassword: jest.fn(async () => false),
  resetGenericPassword: jest.fn(async () => true),
}));

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: View,
    GestureDetector: View,
    PanGestureHandler: View,
    NativeViewGestureHandler: View,
    State: {},
    Directions: {},
  };
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Svg = props => React.createElement(View, props);
  const Path = props => React.createElement(View, props);
  const G = props => React.createElement(View, props);
  return {
    __esModule: true,
    default: Svg,
    Svg,
    Path,
    G,
  };
});

jest.mock('@react-native-community/blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: props => React.createElement(View, props),
  };
});

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(async () => ({ didCancel: true, assets: [] })),
}));

jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(async () => {
    throw { code: 'OPERATION_CANCELED' };
  }),
  types: {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
  isErrorWithCode: error =>
    Boolean(error && typeof error === 'object' && 'code' in error),
}));
