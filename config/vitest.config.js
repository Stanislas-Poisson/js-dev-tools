/**
 * Default Vitest configuration for @stanislas-poisson packages.
 * Provides sensible defaults for TypeScript projects.
 *
 * A project extends it with mergeConfig() and adds its own settings (Vue plugin, jsdom, etc.).
 */

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'cobertura'],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 75,
        statements: 75,
      },
      watermarks: {
        lines: [75, 90],
        functions: [75, 90],
        branches: [75, 90],
        statements: [75, 90],
      },
      exclude: ['node_modules/**', 'dist/**', 'build/**', '**/*.config.*', '**/*.d.ts'],
    },
  },
})
