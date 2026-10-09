module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['**/__tests__/**', 'jest.setup.js', 'jest.config.js'],
      env: { jest: true },
    },
  ],
};
