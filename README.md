# Vite-Fastify-Dev-Plugin
Use Vite as an HMR dev server for a Fastify instance.

> If you were using `VitePluginNode` for this & annoyed by its lack of maintenance, this is the plugin for you.

How to use:
```ts
/// <reference types="vitest" />

import path from 'node:path';
import { defineConfig } from 'vite';
import { ViteFastifyDevPlugin } from './vite_plugins/vite-fastify-dev-plugin'; // <-- Import the plugin

export default defineConfig({
  build: {
    ssr: true,
    target: 'node18',
    minify: true,
    rollupOptions: {
      input: { server: 'src/server.ts' },
      output: { entryFileNames: 'server.js', inlineDynamicImports: true },
    },
  },
  plugins: [ViteFastifyDevPlugin()], // <-- Add the plugin
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    globals: true,
    watch: false,
    coverage: { enabled: true, lines: 80 },
  },
});
```

Configuring plugin options:
```ts
ViteFastifyDevPlugin({
  appPath: string // default: './src/server.ts'
  exportName: string // default: 'app'
})
```