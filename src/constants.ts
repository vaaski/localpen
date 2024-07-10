import { blue, bold, gray, yellow } from "kolorist"

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

${gray("Options:")}
  -h, --help      ${bold("Show this help message")}
  -t, --template  ${bold("Specify a template to use")}

${gray("Post-run options, pick either or get prompted:")}
  -k, --keep      ${bold("Keep the project folder")}
  -d, --delete    ${bold("Delete the project folder")}

Available templates:
${templates
  .map((t) => `  - ${t.color(t.name)}${t.alias ? `/${t.color(t.alias)}` : ""}`)
  .join("\n")}`
