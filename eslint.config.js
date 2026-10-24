import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  ...astro.configs.recommended,
  {
    // Service worker scripts run in the worker global scope, where `self`,
    // `caches` and friends are defined instead of `window`/`document`.
    files: ['public/**/*.js'],
    languageOptions: {
      globals: {
        self: 'readonly',
        caches: 'readonly',
        clients: 'readonly',
      },
    },
  },
  {
    // Node CLI scripts (e.g. the weekly radar generator) run under Node 20+,
    // where `console` and `fetch` are globals; `process` etc. are imported
    // explicitly from `node:*` modules.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        fetch: 'readonly',
      },
    },
  },
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**', 'public/_pagefind/**'],
  },
];
