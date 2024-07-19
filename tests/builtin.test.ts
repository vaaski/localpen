import { expect, test } from "bun:test"
import { access, writeFile } from "node:fs/promises"
import { join } from "node:path"

const testFactory = (
	template: string,
	entryFile: string,
	initialText: string,
) => {
	return async () => {
		const child = Bun.spawn(
			[
				"bun",
				"run",
				"src/index.ts",
				"--template",
				template,
				"--no-code",
				"--delete",
			],
			{
				stdin: "pipe",
				stdout: "pipe",
			},
		)

		const randomString = Math.random().toString(36).slice(2)

		const reader = child.stdout.getReader()
		let chunk = await reader.read()

		let path: string | undefined

		// read the stdout chunkwise
		while (chunk.done === false) {
			chunk = await reader.read()
			if (chunk.value) {
				const text = Buffer.from(chunk.value).toString()

				// save the path of the running project
				if (text.includes("Project is running at:")) {
					;[, path] = text.split("\n")
				}

				// after the default output is printed, update the file
				if (text.includes(initialText)) {
					expect(text).toContain(initialText)

					if (!path) throw new Error("path not found")
					const filePath = join(path, entryFile)
					await writeFile(filePath, `console.log("${randomString}")`)
				}

				// after the file is updated, check if the output is correct
				if (text.includes(randomString)) {
					expect(text).toContain(randomString)
					break
				}
			}
		}

		child.stdin.write("q\n")

		await child.exited
		expect(child.exitCode).toBe(0)

		if (!path) throw new Error("path not found")
		expect(() => access(path)).toThrow()
	}
}

test(
	"run TypeScript template",
	testFactory(
		"typescript",
		"index.ts",
		"Localpen TypeScript template running...",
	),
)

test(
	"run JavaScript template",
	testFactory(
		"javascript",
		"index.js",
		"Localpen JavaScript template running...",
	),
)
