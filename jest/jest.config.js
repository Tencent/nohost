const path = require('path');

module.exports = {
  moduleFileExtensions: ['js'],
  rootDir: '..',
  transform: {
    // '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(t|j)s?$': ['babel-jest', { configFile: path.resolve(__dirname, 'babel.config.js') }],
  },
  testMatch: ['**/test/**/*.test.js'],
  testEnvironment: 'node',
  reporters: ['default'],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  coverageReporters: ['json', 'json-summary', 'lcov', 'text', 'clover'],
};
 