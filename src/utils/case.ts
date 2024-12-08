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
		const upperKey = key.toUpperCase();
		result[`${upperKey}`] = value;
		result[`${upperKey}CAMELCASE`] = camelCase(value);
		result[`${upperKey}KEBABCASE`] = kebabCase(value);
	}
	return result;
}
