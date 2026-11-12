/**
 * Default Prettier configuration for @stanislas-poisson projects.
 */

import { resolve } from './resolve.js'

const config = {
  // Only what differs from the defaults of Prettier: no semicolons and single quotes.
  // The rest is the default (80 columns, 2 spaces, trailing commas everywhere, LF): the width of the Google
  // JavaScript Style Guide, and nothing to keep in step with a tool that is already right.
  semi: false,
  singleQuote: true,

  // Plugin configuration
  plugins: [
    'prettier-plugin-blade',
    '@prettier/plugin-php',
    'prettier-plugin-organize-imports',
  ].map(resolve),

  // File-specific overrides
  overrides: [
    // PHP/Blade files
    {
      files: ['*.blade.php'],
      options: {
        phpVersion: '8.4',
        trailingCommaPHP: true,
      },
    },

    // JSON files (no trailing commas in JSON)
    {
      files: ['*.json', '*.jsonc', 'package.json'],
      options: {
        trailingComma: 'none',
      },
    },
  ],
}

export default config
