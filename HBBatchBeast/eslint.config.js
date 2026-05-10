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
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'commonjs',
      globals: nodeGlobals
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn'
    },
    rules: {
      'constructor-super': 'error',
      'for-direction': 'error',
      'getter-return': 'error',
      'no-async-promise-executor': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': ['error', 'except-parens'],
      'no-const-assign': 'error',
      'no-control-regex': 'error',
      'no-debugger': 'warn',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-else-if': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-empty-character-class': 'error',
      'no-ex-assign': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-loss-of-precision': 'error',
      'no-misleading-character-class': 'error',
      'no-new-native-nonconstructor': 'error',
      'no-obj-calls': 'error',
      'no-promise-executor-return': 'error',
      'no-regex-spaces': 'error',
      'no-self-assign': 'error',
      'no-setter-return': 'error',
      'no-sparse-arrays': 'error',
      'no-this-before-super': 'error',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-private-class-members': 'error',
      'no-useless-backreference': 'error',
      'require-yield': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error'
    }
  }
];
