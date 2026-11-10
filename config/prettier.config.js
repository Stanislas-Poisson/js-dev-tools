/**
 * Default Prettier configuration for @stanislas-poisson projects.
 */

const config = {
  // Core formatting
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',

  // HTML & Vue specific
  htmlWhitespaceSensitivity: 'css',
  vueIndentScriptAndStyle: false,
  singleAttributePerLine: false,

  // JSX specific
  jsxSingleQuote: false,

  // Prose formatting
  proseWrap: 'preserve',
  embeddedLanguageFormatting: 'auto',

  // Plugin configuration
  plugins: ['prettier-plugin-blade', '@prettier/plugin-php', 'prettier-plugin-organize-imports'],

  // File-specific overrides
  overrides: [
    // PHP/Blade files
    {
      files: ['*.blade.php'],
      options: {
        phpVersion: '8.3',
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
