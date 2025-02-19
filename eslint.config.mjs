import loguxTsConfig from '@logux/eslint-config/ts'

export default [
  { ignores: ['docs/api/assets/', '**/errors.ts'] },
  ...loguxTsConfig,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'consistent-return': 'off',
      'global-require': 'off',
      'n/no-unsupported-features/es-syntax': [
        'error',
        {
          ignores: ['hashbang', 'modules']
        }
      ],
      'n/no-unsupported-features/node-builtins': [
        'error',
        { ignores: ['url.fileURLToPath', 'url.pathToFileURL', 'btoa', 'atob'] }
      ],
      'n/prefer-node-protocol': 'off',
      'perfectionist/sort-switch-case': 'off'
    }
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-redeclare': 'off',
      'n/no-unsupported-features/es-syntax': 'off'
    }
  },
  {
    files: ['**/*.test.*', '**/types.ts'],
    rules: {
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'func-style': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      'no-console': 'off',
      'no-unused-expressions': 'off'
    }
  }
]
