import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'src_migration']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/pages/**/*.{ts,tsx}', 'src/components/**/*.tsx', 'src/contexts/**/*.{ts,tsx}'],
    rules: {
      'max-lines-per-function': ['error', { max: 180, skipBlankLines: true, skipComments: true, IIFEs: true }],
    },
  },
  {
    files: ['src/components/common/**/*.{ts,tsx}', 'src/components/layout/ModalShell.tsx'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['**/contexts/**'], message: 'Common components must not import from contexts.' },
          { group: ['**/pages/**'], message: 'Common components must not import from pages.' },
        ],
      }],
    },
  },
  {
    files: ['src/contexts/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['**/pages/**'], message: 'Contexts must not import from pages.' },
          { group: ['**/components/**'], message: 'Contexts must not import from components.' },
        ],
      }],
    },
  },
])
