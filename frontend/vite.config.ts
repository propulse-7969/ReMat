import type { ServerOptions } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(isDev ? [basicSsl()] : []),
    ],
    server: isDev
      ? ({ https: true } as unknown as ServerOptions)
      : undefined,
  }
})
