import { defineConfig } from 'vite'
//@ts-ignore
import { swcReactRefresh } from "vite-plugin-swc-react-refresh";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    swcReactRefresh(),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: "__tla",
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: i => `__tla_${i}`
    })
  ],
  esbuild: { 
    jsx: "automatic"
  },
})
