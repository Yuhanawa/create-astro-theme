import { execSync } from "node:child_process";
import { log } from "@clack/prompts";

// biome-ignore lint/suspicious/noExplicitAny: allowed
export default (command: string, ...args: any[]) => {
	// biome-ignore lint/suspicious/noExplicitAny: globalThis
	if ((globalThis as any).dryRun ?? false) {
		log.info(`[DryRun] execute command: ${command} args: ${args.map((arg) => JSON.stringify(arg)).join(", ")}`);
		return;
	}
	execSync(command, ...args);
};
