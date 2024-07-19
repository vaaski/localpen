import { mkdir, readdir, rename, rm } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { spawnerInstance } from "../src/util"

const __dirname = dirname(fileURLToPath(import.meta.url))

const OUTPUT_FOLDER = join(__dirname, "../templates/vite")
const tempFolder = join(__dirname, "../.temp")

await rm(tempFolder, { recursive: true, force: true })
await mkdir(tempFolder, { recursive: true })

const spawner = spawnerInstance({
	cwd: tempFolder,
	stdio: ["inherit", "inherit", "inherit"],
})

await spawner(["bunx", "degit", "vitejs/vite/packages/create-vite"]).exited

const content = await readdir(tempFolder)
const nonTemplates = content.filter((file) => !file.startsWith("template-"))
const templates = content.filter((file) => file.startsWith("template-"))

for (const item of nonTemplates) {
	const path = join(tempFolder, item)
	await rm(path, { recursive: true, force: true })
}

await rm(OUTPUT_FOLDER, { recursive: true, force: true })
await mkdir(OUTPUT_FOLDER, { recursive: true })

for (const item of templates) {
	const path = join(tempFolder, item)
	const newName = item.replace("template-", "")
	const newPath = join(OUTPUT_FOLDER, newName)

	await rename(path, newPath)
}

await rm(tempFolder, { recursive: true, force: true })
