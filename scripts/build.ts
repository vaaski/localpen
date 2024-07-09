const BANNER = "#!/usr/bin/env bun\n"

await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  minify: true,
})

const file = Bun.file("./dist/index.js")
const text = await file.text()
const output = BANNER + text

await Bun.write("./dist/index.js", output)
