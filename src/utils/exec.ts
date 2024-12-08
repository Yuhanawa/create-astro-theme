import { execSync } from "node:child_process";
import { log } from "@clack/prompts";

// biome-ignore lint/suspicious/noExplicitAny: globalThis
const dryRun = () => (globalThis as any).dryRun ?? false;

// biome-ignore lint/suspicious/noExplicitAny: allowed
export default (command: string, ...args: any[]) => {
	if (dryRun()) {
		log.info(`[DryRun] execute command: ${command} args: ${args.map((arg) => JSON.stringify(arg)).join(", ")}`);
		return;
	}
	execSync(command, ...args);
};
