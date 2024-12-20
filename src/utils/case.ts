export function camelCase(str: string) {
	return str
		.replace(/[-_]/g, " ")
		.replace(/\s+(.)/g, (_, c) => c.toUpperCase())
		.replace(/^./, (s) => s.toLowerCase());
}

export function kebabCase(str: string) {
	return str
		.replace(/[-_\s]+/g, "-")
		.replace(/([A-Z])/g, "-$1")
		.replace(/^-/, "")
		.toLowerCase();
}

export function getAllCase(str: Record<string, string>): Record<string, string> {
	const result: Record<string, string> = {};
	for (const [key, value] of Object.entries(str)) {
		result[`${key}`] = value;
		result[`${key}CamelCase`] = camelCase(value);
		result[`${key}KebabCase`] = kebabCase(value);
	}
	return result;
}
