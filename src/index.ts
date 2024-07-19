import { black, blue, bold, gray, magenta, red, white } from "kolorist"
import minimist from "minimist"
import { cp, mkdir, readdir, rm } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import temporaryPath from "temporary-path"

import prompts from "prompts"
import { type Template, helpMessage, templates } from "./constants"
import {
	VITE_TEMPLATES_FOLDER,
	copyViteTemplate,
	createVite,
} from "./create-vite"
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

if (argv.help) {
	console.log(await helpMessage())
	process.exit(0)
}

if (argv.delete && argv.keep) {
	console.log(red(bold("Cannot use both --delete and --keep")))
	process.exit(1)
}

let template: Template | undefined
if (argv.template) {
	template = templates.find((t) => {
		return (
			t.name.toLowerCase() === argv.template?.toLowerCase() ||
			t.alias?.toLowerCase() === argv.template?.toLowerCase()
		)
	})
	if (!template) {
		const viteTemplates = await readdir(VITE_TEMPLATES_FOLDER)
		if (viteTemplates.includes(argv.template)) {
			template = {
				vite: true,
				name: "vite",
				variant: argv.template,
				color: magenta,
			}
		}
	}
} else {
	const templatePrompt = await prompts({
		type: "select",
		name: "template",
		message: "Select a template",
		choices: templates.map((t) => ({
			title: t.color(t.name),
			value: t,
		})),
	})

	template = templatePrompt.template as Template

	if (!template) {
		console.log(gray("No template selected."))
		process.exit(0)
	}
}

if (!template) {
	console.log(red(bold(`Template ${black(argv.template ?? "")} not found`)))
	console.log(await helpMessage())
	process.exit(1)
}

const tempFolder = temporaryPath()

const spawner = spawnerInstance({
	cwd: tempFolder,
	stdio: ["inherit", "inherit", "inherit"],
})

if ("vite" in template) {
	const projectPath = join(tempFolder, "localpen-vite")
	await mkdir(tempFolder, { recursive: true })

	if (template.variant) {
		await copyViteTemplate(template.variant, projectPath)
	} else {
		try {
			await createVite(projectPath)
		} catch (error) {
			if (error instanceof Error) {
				console.log(gray(error.message))
			}
			process.exit(0)
		}
	}

	console.log(gray("Installing dependencies..."))
	await spawner(["bun", "install"], { cwd: projectPath }).exited

	console.log(gray("Opening project in VS Code..."))
	const codeInstance = spawner(["code", "-n", "-w", projectPath])

	console.clear()
	console.log(
		bold(blue(`Close the VS Code tab or press ${white("q + enter")} to exit`)),
	)
	console.log(gray(`${separator()}\n`))

	console.log(gray("Running project..."))
	const runInstance = spawner(
		["bunx", "vite", "--open", "--clearScreen", "false"],
		{
			cwd: projectPath,
		},
	)

	await Promise.any([codeInstance.exited, runInstance.exited])

	runInstance.kill()
	codeInstance.kill()
	await Promise.all([codeInstance.exited, runInstance.exited])
} else {
	const templatePath = join(__dirname, "../templates", template.folder)

	await cp(templatePath, tempFolder, { recursive: true })

	console.log(gray("Installing dependencies..."))
	await spawner(["bun", "install", "--frozen-lockfile"]).exited

	console.log(gray("Opening project in VS Code..."))
	const codeInstance = spawner(["code", "-r", "-w", template.editorEntry])

	console.log(gray("Running project..."))
	const runInstance = spawner(template.entry)

	process.stdin.setRawMode(true)
	process.stdin.resume()
	process.stdin.on("data", async (key) => {
		switch (key.toString()) {
			case "q":
			case "\u0003": // ctrl-c
				codeInstance.kill()
				break
			default:
				console.log(key.toString())
				break
		}
	})

	console.clear()
	console.log(
		bold(blue(`Close the VS Code tab or press ${white("q")} to exit`)),
	)
	console.log(gray(`${separator()}\n`))

	await codeInstance.exited
	runInstance.kill()
	process.stdin.pause()
}

console.clear()

let keep = argv.keep && !argv.delete
if (!argv.delete && !argv.keep) {
	const keepPrompt = await prompts({
		type: "confirm",
		name: "keep",
		message: "Keep the project folder?",
		initial: false,
	})

	keep = keepPrompt.keep as boolean
}

if (keep) {
	console.log(gray(`The folder is kept at ${tempFolder}`))
} else {
	await rm(tempFolder, { recursive: true, force: true })
	console.log(gray(`Deleted ${tempFolder}`))
}
