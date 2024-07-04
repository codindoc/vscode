import {
  copyFileSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  statSync,
  writeFileSync,
} from "node:fs"
import {join} from "node:path"

const outputFolder = "extension"

// Empty output folder.
console.log(`\x1b[34m[>] empty output folder: ${outputFolder}\x1b[0m`)
for (const name of readdirSync(outputFolder)) {
  const path = join(outputFolder, name)
  try {
    statSync(path).isDirectory() ? rmdirSync(path) : rmSync(path)
    console.log(`\x1b[2m    [v] old content removed: ${path}\x1b[0m`)
  } catch (e) {
    console.log(`\x1b[33m    [!] cannot remove: ${path}\x1b[0m`)
  }
}

// Copy other files.
function copyAssets(name) {
  try {
    copyFileSync(name, join(outputFolder, name))
  } catch (e) {
    console.log(`\x1b[31m    [x] cannot copy: ${name}\x1b[0m`)
    throw e
  }
  console.log(`\x1b[2m    [v] copy asset: ${name}\x1b[0m`)
}
console.log("\x1b[34m[>] copy static assets:\x1b[0m")
copyAssets("README.md")
copyAssets("LICENSE.txt")
copyAssets("CHANGELOG.md")

// Process manifest file.
console.log("\x1b[34m[>] node manifest properties update:\x1b[0m")
const manifest = JSON.parse(readFileSync("package.json").toString())
function updateManifest(key, value) {
  manifest[key] = value
  console.log(`\x1b[2m    [v] manifest[${key}] => ${value}\x1b[0m`)
}
updateManifest("type", undefined)
updateManifest("scripts", undefined)
updateManifest("dependencies", undefined)
updateManifest("devDependencies", undefined)
try {
  writeFileSync("extension/package.json", JSON.stringify(manifest))
} catch (e) {
  console.log(`\x1b[31m    [x] cannot write manifest output\x1b[0m`)
  throw e
}

// Log.
console.log("\x1b[32m[v] preprocess finished.\x1b[0m")
