import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@/dev/DevPersonaProvider": path.resolve(
        __dirname,
        mode !== "production"
          ? "./src/dev/DevPersonaProvider.tsx"
          : "./src/dev/productionPersonaProvider.tsx"
      ),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
  },
}));
