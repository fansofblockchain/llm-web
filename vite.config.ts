import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
function pathResolve(dir) {
  return resolve(__dirname, ".", dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": pathResolve("src/"),
      assets: pathResolve("src/assets"),
      pages: pathResolve("src/pages/"),
      common: pathResolve("src/pages/common"),
    },
    extensions: [".js", ".json", ".ts"],
  },
  css: {
    // css预处理器
    preprocessorOptions: {
      less: {
        charset: false,
        // additionalData: '@import "./src/assets/style/global.less";',
      },
    },
  },
  server: {
    cors: true, // 默认启用并允许任何源
  },
});
