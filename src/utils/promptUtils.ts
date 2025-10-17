import * as p from "@clack/prompts";

const promptWithCancel = async (
	// biome-ignore lint/suspicious/noExplicitAny: suppress
	prompt: () => Promise<any | symbol>,
	cancel: (value: symbol) => void = (value) => {
		if (p.isCancel(value)) {
			p.cancel("Operation cancelled.");
			process.exit(0);
		}
	},
) => {
	const value = await prompt();
	cancel(value);
	return value;
};

export const pwc = promptWithCancel;
