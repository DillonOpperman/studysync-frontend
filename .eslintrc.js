module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Theme tokens are applied at render time; StyleSheet.create cannot hold them.
    'react-native/no-inline-styles': 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/**', 'jest.setup.js', 'jest.config.js'],
      env: { jest: true },
    },
  ],
};
