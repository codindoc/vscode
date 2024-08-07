import typescript from "@rollup/plugin-typescript"
import {defineConfig} from "rollup"

export default defineConfig({
  plugins: [typescript({compilerOptions: {sourceMap: true}})],
  external: ["path", "vscode", "vscode-languageclient/node"],
  input: "extension.ts",
  output: {file: "extension/extension.js", format: "commonjs", sourcemap: true},
})
