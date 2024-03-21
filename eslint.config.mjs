import loguxTsConfig from '@logux/eslint-config/ts'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { ignores: ['docs/api/assets/', '**/errors.ts'] },
  ...loguxTsConfig,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'consistent-return': 'off',
      'global-require': 'off',
      'node-import/prefer-node-protocol': 'off'
    }
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-redeclare': 'off'
    }
  },
  {
    files: ['**/*.test.*', '**/types.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      'func-style': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
      'no-console': 'off',
      'no-unused-expressions': 'off'
    }
  }
]
