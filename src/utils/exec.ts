import { execSync } from "node:child_process";
import { log } from "@clack/prompts";
import { getDryRun } from "./dryRun";

// biome-ignore lint/suspicious/noExplicitAny: allowed
export default (command: string, ...args: any[]) => {
	if (getDryRun()) {
		log.info(`[DryRun] execute command: ${command} {args: ${args.map((arg) => JSON.stringify(arg)).join(", ")}}`);
		return;
	}
	execSync(command, ...args);
};
