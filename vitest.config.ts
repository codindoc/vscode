// vite.config.ts
/// <reference types="vitest" />
import {defineConfig} from "vitest/config"

const sources = ["*.ts", "examples/.{ts,js,cjs}"]
export default defineConfig({test: {includeSource: sources}})
