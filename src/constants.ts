import { blue, bold, gray, magenta, yellow } from "kolorist"
import { getViteTemplateVariantsColors } from "./create-vite"

export type TemplateBuiltin = {
	name: string
	folder: string
	color: (str: string | number) => string
	editorEntry: string
	entry: string[]
	alias?: string
}
export type TemplateVite = Omit<
	TemplateBuiltin,
	"folder" | "entry" | "editorEntry"
> & {
	vite: true
	variant?: string
}

export type Template = TemplateBuiltin | TemplateVite

export const templates: Template[] = [
	{
		name: "TypeScript",
		alias: "ts",
		folder: "typescript",
		color: blue,
		editorEntry: "index.ts",
		entry: ["bun", "run", "--watch", "index.ts"],
	},
	{
		name: "JavaScript",
		alias: "js",
		folder: "javascript",
		color: yellow,
		editorEntry: "index.js",
		entry: ["bun", "run", "--watch", "index.js"],
	},
	{
		name: "Vite",
		alias: "v",
		color: magenta,
		vite: true,
	},
]

export const helpMessage = async () => {
	const viteTemplateStrings = []
	const viteVariants = await getViteTemplateVariantsColors()

	for (const [name, data] of viteVariants) {
		let variantString = data.color(name)

		for (const [variant, color] of data.variants) {
			if (variant === "TypeScript") variantString += ` (-${color("ts")})`
		}

		viteTemplateStrings.push(variantString)
	}

	return `
Usage: localpen [options]

${gray("Options:")}
  -h, --help      ${bold("Show this help message")}
  -t, --template  ${bold("Specify a template to use")}
  -n, --no-code   ${bold("Don't open the project in VS Code")}

${gray("Deletion options, pick either or get prompted:")}
  -k, --keep      ${bold("Keep the project folder")}
  -d, --delete    ${bold("Delete the project folder")}

Available templates:
${templates
	.map((t) => `  - ${t.color(t.name)}${t.alias ? `/${t.color(t.alias)}` : ""}`)
	.join("\n")}

Vite templates:
${viteTemplateStrings.map((t) => `  - ${t}`).join("\n")}`
}
