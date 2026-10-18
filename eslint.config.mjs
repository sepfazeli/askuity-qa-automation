import eslint from '@eslint/js';
import wdio from 'eslint-plugin-wdio';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/', 'reports/'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  wdio.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Missing awaits cause flaky WebdriverIO tests.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      // No fixed sleeps.
      'wdio/no-pause': 'error',
      // Allows `const { a, ...rest } = obj` to drop a field.
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
    },
  },
);
