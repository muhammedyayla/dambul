import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const mapBoxToken = env.map_box_token ?? "";
  return {
    plugins: [react(), tailwindcss()],
    define: {
      "import.meta.env.VITE_MAP_BOX_TOKEN": JSON.stringify(mapBoxToken),
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  };
});
