export const spawnerInstance = (options?: Parameters<typeof Bun.spawn>[1]) => {
	return (
		command: Parameters<typeof Bun.spawn>[0],
		overrides?: Parameters<typeof Bun.spawn>[1],
	) => Bun.spawn(command, { ...options, ...overrides })
}

export const separator = () => {
	const width = process.stdout.columns
	return "─".repeat(width)
}
