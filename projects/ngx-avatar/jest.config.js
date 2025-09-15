const baseConfig = require('../../jest.config');

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '@core/(.*)': '<rootDir>/src/app/core/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/projects/ngx-avatar/tsconfig.spec.json',
    },
  },
};
