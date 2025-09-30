import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    extension: 'packages/client/src/extension.ts',
    server: 'packages/server/src/server.ts',
  },
  external: ['vscode'],
  sourcemap: import.meta.env.NODE_ENV === 'development',
})

declare global {
  interface ImportMeta {
    env: {
      NODE_ENV?: string
    }
  }
}
