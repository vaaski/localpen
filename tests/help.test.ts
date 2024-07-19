import { expect, test } from "bun:test"
import { removeColors } from "./_shared"

const helpOutput = `
Usage: localpen [options]

Options:
  -h, --help      Show this help message
  -t, --template  Specify a template to use
  -n, --no-code   Don't open the project in VS Code

Deletion options, pick either or get prompted:
  -k, --keep      Keep the project folder
  -d, --delete    Delete the project folder

Available templates:
  - TypeScript/ts
  - JavaScript/js
  - Vite/v

Vite templates:
  - lit (-ts)
  - preact (-ts)
  - qwik (-ts)
  - react (-ts)
  - solid (-ts)
  - svelte (-ts)
  - vanilla (-ts)
  - vue (-ts)
`
test("print help message", async () => {
	const child = Bun.spawn(["bun", "run", "src/index.ts", "--help"])
	const text = await new Response(child.stdout).text()

	await child.exited

	expect(removeColors(text)).toBe(helpOutput)
})

test("print help message on wrong template", async () => {
	const child = Bun.spawn(["bun", "run", "src/index.ts", "--template", "foo"])
	const text = await new Response(child.stdout).text()

	await child.exited

	expect(removeColors(text)).toContain(helpOutput)
	expect(removeColors(text)).toContain(" not found")
})
