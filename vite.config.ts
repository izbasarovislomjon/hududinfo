import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const GEOASR_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoid2ViX3VzZXIiLCJleHAiOjE3Nzk4Mzk0ODV9.WCy4ooIDvL0o8G5udEuba4POyJMMH2CnjM2FcgybG10";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/", // 🔹 MUHIM
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api/geoasr": {
        target: "https://duasr.uz",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/geoasr/, "/api4"),
        headers: {
          Authorization: `Bearer ${GEOASR_TOKEN}`,
        },
      },
      "/api/report-validation": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
