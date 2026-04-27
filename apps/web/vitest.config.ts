import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    // Exclude Playwright E2E tests — run those with: npx playwright test
    exclude: ['tests/e2e/**', '**/node_modules/**'],
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@domain': path.resolve(__dirname, '../../packages/domain/src'),
      '@ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@rag': path.resolve(__dirname, '../../packages/rag/src'),
      '@kg': path.resolve(__dirname, '../../packages/kg/src'),
      '@llm': path.resolve(__dirname, '../../packages/llm-router/src'),
      '@api-client': path.resolve(__dirname, '../../packages/api-client/src'),
    },
  },
})