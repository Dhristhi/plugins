import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off'
    }
  },
  {
    files: [
      'src/**/*.{js,jsx,ts,tsx}',
      'packages/**/src/**/*.{js,jsx,ts,tsx}',
      'apps/**/src/**/*.{js,jsx,ts,tsx}'
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-refresh/only-export-components': 'off'
      
    },
    settings: {
      react: { version: 'detect' }
    }
  },
  {
    files: [
      'src/__tests__/**/*.{js,jsx,ts,tsx}',
      'packages/**/src/__tests__/**/*.{js,jsx,ts,tsx}',
      'apps/**/src/__tests__/**/*.{js,jsx,ts,tsx}'
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.vitest }
    }
  }
];
