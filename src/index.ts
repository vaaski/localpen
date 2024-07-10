import { black, blue, bold, gray, red } from "kolorist"
import minimist from "minimist"
import { cp, rm } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import temporaryPath from "temporary-path"

import prompts from "prompts"
import { helpMessage, templates } from "./constants"
import { separator, spawnerInstance } from "./util"

const __dirname = dirname(fileURLToPath(import.meta.url))

const argv = minimist<{
  template?: string
  help?: boolean
  keep?: boolean
  delete?: boolean
}>(process.argv.slice(2), {
  default: {
    help: false,
    delete: false,
    keep: false,
  },
  alias: {
    h: "help",
    t: "template",
    k: "keep",
    d: "delete",
  },
  string: ["_"],
})

if (argv.help || !argv.template) {
  console.log(helpMessage)
  process.exit(0)
}

if (argv.delete && argv.keep) {
  console.log(red(bold("Cannot use both --delete and --keep")))
  process.exit(1)
}

const template = templates.find(
  (t) => t.name === argv.template || t.alias === argv.template,
)

if (!template) {
  console.log(red(bold(`Template ${black(argv.template ?? "")} not found`)))
  console.log(`${helpMessage}`)
  process.exit(1)
}

const tempFolder = temporaryPath()
const templatePath = join(__dirname, "../templates", template.folder)

await cp(templatePath, tempFolder, { recursive: true })

const spawner = spawnerInstance({
  cwd: tempFolder,
  stdio: ["inherit", "inherit", "inherit"],
})

console.log(gray("Installing dependencies..."))
await spawner(["bun", "install", "--frozen-lockfile"]).exited

console.log(gray("Opening project in VS Code..."))
const codeInstance = spawner(["code", "-r", "-w", template.editorEntry])

console.log(gray("Running project..."))
const runInstance = spawner(template.entry)

console.clear()
console.log(bold(blue("Close the VS Code window/tab to exit")))
console.log(gray(`${separator()}\n`))

await codeInstance.exited
runInstance.kill()

console.clear()

let keep = argv.keep && !argv.delete
if (!argv.delete && !argv.keep) {
  const keepPrompt = await prompts({
    type: "confirm",
    name: "keep",
    message: "Keep the project folder?",
    initial: false,
  })

  keep = keepPrompt.keep
}

if (keep) {
  console.log(`The folder is kept at ${tempFolder}`)
} else {
  await rm(tempFolder, { recursive: true, force: true })
}
