
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5173,
    strictPort: true,

    proxy: {
      "/api": {
        target: "https://mockapi-mauve.vercel.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
