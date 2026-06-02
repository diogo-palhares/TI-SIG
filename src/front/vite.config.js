import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Frontend roda em http://localhost:5173 (padrão do Vite).
// O backend (Spring Boot) roda em http://localhost:8080 e tem CORS liberado.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
