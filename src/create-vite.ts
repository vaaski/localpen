// the reason the create-vite behavior is duplicated here is because
// prompts seem to mess up the stdin for the create-vite child process

import * as colors from "kolorist"
import { cp, readdir, rename } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import prompts from "prompts"

const __dirname = dirname(fileURLToPath(import.meta.url))
export const VITE_TEMPLATES_FOLDER = join(__dirname, "../templates/vite")

const COLOR_STARTS_WITH = Object.entries({
	vanilla: colors.yellow,
	vue: colors.green,
	react: colors.cyan,
	preact: colors.magenta,
	lit: colors.lightRed,
	svelte: colors.red,
	solid: colors.blue,
	qwik: colors.lightBlue,
}) as [string, (str: string | number) => string][]

export type ViteFlavor = {
	color: typeof colors.blue
	variants: ["TypeScript" | "JavaScript", typeof colors.blue][]
}
export type ViteTemplateMap = { [name: string]: ViteFlavor }
export type ViteTemplateEntry = [string, ViteFlavor]

export const getViteTemplateVariantsColors = async (): Promise<
	ViteTemplateEntry[]
> => {
	const contents = await readdir(VITE_TEMPLATES_FOLDER)
	const map: ViteTemplateMap = {}

	for (const viteTemplate of contents) {
		const colorMatch = COLOR_STARTS_WITH.find(([color]) =>
			viteTemplate.startsWith(color),
		)
		const color = colorMatch ? colorMatch[1] : colors.gray

		const [name, variantName] = viteTemplate.split("-")
		if (!name) throw new Error(`Invalid template name: ${viteTemplate}`)

		if (!map[name]) map[name] = { color, variants: [] }

		const variant = variantName === "ts" ? "TypeScript" : "JavaScript"
		const variantColor = variant === "TypeScript" ? colors.blue : colors.yellow
		map[name].variants.push([variant, variantColor])
	}

	const sorted = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
	return sorted
}

const renameFiles = {
	_gitignore: ".gitignore",
}
export const copyViteTemplate = async (
	templateFolder: string,
	outputFolder: string,
) => {
	const templatePath = join(VITE_TEMPLATES_FOLDER, templateFolder)

	await cp(templatePath, outputFolder, { recursive: true })

	const outputFolderContents = await readdir(outputFolder)
	for (const [current, target] of Object.entries(renameFiles)) {
		if (outputFolderContents.includes(current)) {
			await rename(join(outputFolder, current), join(outputFolder, target))
		}
	}
}

export const createVite = async (folder: string) => {
	const viteTemplates = await getViteTemplateVariantsColors()

	const templatePrompt = await prompts({
		type: "select",
		name: "template",
		message: "Select a create-vite template",
		choices: viteTemplates.map((template) => ({
			title: template[1].color(template[0]),
			value: template,
		})),
	})

	const template = templatePrompt.template as ViteTemplateEntry
	if (!template) throw new Error("No template selected.")

	if (template[1].variants.length > 1) {
		const variantPrompt = await prompts({
			type: "select",
			name: "variant",
			message: "Select a variant",
			choices: template[1].variants
				.map((variant) => ({
					title: variant[1](variant[0]),
					value: variant[0] === "TypeScript" ? "-ts" : "",
				}))
				.sort((a, b) => b.title.localeCompare(a.title)),
		})

		if (variantPrompt.variant === undefined) {
			throw new Error("No variant selected.")
		}

		const templateFolder = template[0] + variantPrompt.variant
		await copyViteTemplate(templateFolder, folder)
	} else {
		const templateFolder = template[0]
		await copyViteTemplate(templateFolder, folder)
	}
}
