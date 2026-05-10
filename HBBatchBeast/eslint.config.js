const js = require('@eslint/js');

const nodeGlobals = {
  __dirname: 'readonly',
  Buffer: 'readonly',
  clearInterval: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
  exports: 'readonly',
  module: 'readonly',
  process: 'readonly',
  require: 'readonly',
  setInterval: 'readonly',
  setTimeout: 'readonly'
};

module.exports = [
  {
    ignores: [
      'Config/**',
      'Logs/**',
      'node_modules/**',
      'release-builds/**'
    ]
  },
  {
    ...js.configs.recommended,
    files: ['**/*.js'],
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: 2018,
      sourceType: 'commonjs',
      globals: nodeGlobals
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn'
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-empty': 'off',
      'no-debugger': 'warn',
      'no-redeclare': 'off',
      'no-undef': 'off',
      'no-unused-vars': ['warn', {
        args: 'none',
        caughtErrors: 'none',
        varsIgnorePattern: '^_'
      }],
      'no-useless-assignment': 'off',
      'no-useless-escape': 'off'
    }
  }
];
