/**
 * Default Vitest configuration for @stanislas-poisson packages.
 * Provides sensible defaults for TypeScript projects.
 *
 * A project extends it with mergeConfig() and adds its own settings (Vue plugin, jsdom, etc.).
 */

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'cobertura'],
      reportsDirectory: 'build/coverage',
      exclude: ['node_modules/**', 'dist/**', 'build/**', '**/*.config.*', '**/*.d.ts'],
    },
  },
})
