import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Polyfill Node.js built-ins required by siwe v2 (@spruceid/siwe-parser uses buffer)
  resolve: {
    alias: {
      buffer: "buffer/",
    },
  },
  optimizeDeps: {
    include: ["buffer"],
  },

  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
