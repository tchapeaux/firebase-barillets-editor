import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Vue recommended rules
  ...pluginVue.configs['flat/recommended'],

  // Custom configuration
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // Vue-specific rules
      'vue/multi-word-component-names': 'off', // Allow single-word component names
      'vue/no-v-html': 'warn', // Warn about v-html usage (XSS risk)
      'vue/require-default-prop': 'off', // Optional props don't need defaults
      'vue/no-unused-vars': 'error',

      // TypeScript-specific rules
      '@typescript-eslint/no-explicit-any': 'warn', // Warn instead of error for any
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // General rules
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'dist-ssr/**',
      'dev-dist/**',
      'node_modules/**',
      '.firebase/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
    ],
  },

  // Prettier config (must be last to override conflicting rules)
  eslintConfigPrettier,
];
