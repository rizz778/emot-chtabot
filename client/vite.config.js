import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  assetsInclude: ['**/*.glb'],
  plugins: [react(), 
    tailwindcss(),
  ],
  esbuild: {
    jsxInject: `import 'regenerator-runtime/runtime'`
  }
});