import terser from "@rollup/plugin-terser"
import typescript from "@rollup/plugin-typescript"
import {defineConfig} from "rollup"

export default defineConfig({
  plugins: [typescript(), terser()],
  external: ["path", "vscode", "vscode-languageclient/node"],
  input: "extension.ts",
  output: {file: "extension/extension.js", format: "commonjs"},
})
