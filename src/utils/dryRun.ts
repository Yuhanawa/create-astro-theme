declare global {
	var dryRun: boolean;
}

export const getDryRun = (): boolean => globalThis.dryRun ?? false;
// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
export const setDryRun = (dryRun: boolean) => (globalThis.dryRun = dryRun);
