import replace from "@rollup/plugin-replace"
import terser from "@rollup/plugin-terser"
import typescript from "@rollup/plugin-typescript"
import {defineConfig} from "rollup"
import config from "./rollup.config.dev.js"

export default defineConfig({
  plugins: [
    typescript(),
    replace({"import.meta.vitest": "undefined"}),
    terser({compress: {drop_console: true}}),
  ],
  ...config,
})
