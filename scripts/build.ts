import { unlink } from "node:fs/promises"
import { platform } from "node:os"

const BANNER = "#!/usr/bin/env bun\n"

try {
  await unlink("./dist/index.js")
} catch {}

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  minify: true,
  target: "bun",
})

if (!result.success) {
  console.log(result.logs)
  process.exit(1)
}

const file = Bun.file("./dist/index.js")
const text = await file.text()
const output = BANNER + text

await Bun.write("./dist/index.js", output)
if (platform() !== "win32") {
  Bun.spawn(["chmod", "+x", "./dist/index.js"])
}
