import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig(async () => {
  // Importação dinâmica evita o erro de "ESM file cannot be loaded by require"
  const tailwindcss = (await import('@tailwindcss/vite')).default;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
