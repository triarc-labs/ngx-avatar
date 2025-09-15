module.exports = {
  preset: 'jest-preset-angular',
  //globalSetup: 'jest-preset-angular/global-setup',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  // Ensure a single provider for 'ngx-avatar' during tests to avoid ambiguity between 'projects' and 'dist'
  moduleNameMapper: {
    '^ngx-avatar$': '<rootDir>/projects/ngx-avatar/src/public_api.ts',
  },
  // Exclude built artifacts from Jest's module resolution to prevent duplicate module names
  modulePathIgnorePatterns: ['<rootDir>/dist'],
};
