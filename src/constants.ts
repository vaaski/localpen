import { blue, bold, gray, magenta, yellow } from "kolorist"

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
		name: "create-vite",
		alias: "v",
		color: magenta,
		vite: true,
	},
]

export const helpMessage = `
Usage: localpen [options]

${gray("Options:")}
  -h, --help      ${bold("Show this help message")}
  -t, --template  ${bold("Specify a template to use")}

${gray("Deletion options, pick either or get prompted:")}
  -k, --keep      ${bold("Keep the project folder")}
  -d, --delete    ${bold("Delete the project folder")}

Available templates:
${templates
	.map((t) => `  - ${t.color(t.name)}${t.alias ? `/${t.color(t.alias)}` : ""}`)
	.join("\n")}`
