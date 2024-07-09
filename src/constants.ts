import { blue, yellow } from "kolorist"

type Template = {
  name: string
  folder: string
  color: (str: string | number) => string
  editorEntry: string
  entry: string[]
  alias?: string
}

export const templates: Template[] = [
  {
    name: "typescript",
    alias: "ts",
    folder: "typescript",
    color: blue,
    editorEntry: "index.ts",
    entry: ["bun", "run", "--watch", "index.ts"],
  },
  {
    name: "javascript",
    alias: "js",
    folder: "javascript",
    color: yellow,
    editorEntry: "index.js",
    entry: ["bun", "run", "--watch", "index.js"],
  },
]

export const helpMessage = `
Usage: localpen [options]

Options:
  -h, --help     Show this help message
  -t, --template Specify a template to use

Available templates:
${templates
  .map((t) => `  - ${t.color(t.name)}${t.alias ? `/${t.color(t.alias)}` : ""}`)
  .join("\n")}`
