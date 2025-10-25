import { exec } from "node:child_process";
import util from "node:util";
import * as p from "@clack/prompts";
import fs from "fs-extra";
import { copyDirAndBackupFiles } from "../utils/fsUtils";
import { getBackupPath } from "../utils/pathUtils";
import { copyTemplateDir, copyTemplateFile } from "../utils/templateUtils";

const promisifyExec = util.promisify(exec);

export type actions = action[];
export type action =
	| { type: "CREATE_DIR"; path: string }
	| {
			type: "WRITE_FILE";
			path: string;
			content: string;
	  }
	| {
			type: "COPY_DIR";
			dir: string;
			target: string;
			overwrite?: true | false | "ask" | "backup";
	  }
	| {
			type: "COPY_FILE";
			file: string;
			target: string;
			overwrite?: true | false | "ask" | "backup";
	  }
	| {
			type: "COPY_TEMPLATE_DIR";
			dir: string;
			target: string;
			// biome-ignore lint/suspicious/noExplicitAny: suppress
			data?: Record<string, any>;
	  }
	| {
			type: "COPY_TEMPLATE_FILE";
			file: string;
			target: string;
			templatePath?: string;
			// biome-ignore lint/suspicious/noExplicitAny: suppress
			data?: Record<string, any>;
	  }
	| {
			type: "DELETE_FILE";
			path: string;
	  }
	| {
			type: "DELETE_DIR";
			path: string;
	  }
	| {
			type: "RUN_COMMAND";
			command: string;
			cwd?: string;
	  };
export type actionType = action["type"];

export const run = async (actions: actions, { dryRun, verbose }: { dryRun: boolean; verbose: boolean }) => {
	const showLog = dryRun || verbose;
	for (const action of actions) {
		switch (action.type) {
			case "CREATE_DIR":
				if (!dryRun) {
					await fs.mkdirs(action.path);
				}
				if (showLog) {
					console.log(`CREATE_DIR: ${action.path}`);
				}
				break;
			case "WRITE_FILE":
				if (!dryRun) {
					await fs.writeFile(action.path, action.content);
				}
				if (showLog) {
					console.log(`WRITE_FILE: ${action.path}, content: (next line)\n${action.content}`);
				}
				break;
			case "COPY_DIR": {
				if (!(await fs.pathExists(action.dir))) {
					// not exists, skip
					if (showLog) {
						console.log(`COPY_DIR: Source directory "${action.dir}" does not exist, skipping...`);
					}
					return;
				}

				const targetExists = await fs.pathExists(action.target);
				let shouldCopy = true;
				let overwriteOption = action.overwrite === true; // Default to true if explicitly set

				if (!dryRun && targetExists) {
					if (action.overwrite === "ask") {
						// TODO: Separate Logic
						const answer = await p.confirm({
							message: `Target "${action.target}" already exists. Overwrite?`,
						});
						if (answer) overwriteOption = true;
						else shouldCopy = false;
					} else if (action.overwrite === "backup") {
						if (showLog) {
							console.log(`COPY_DIR: Merging "${action.dir}" into "${action.target}" with file backup...`);
						}
						await copyDirAndBackupFiles(action.dir, action.target, showLog);

						shouldCopy = false;
					} else if (overwriteOption === false) {
						// If overwrite is false or undefined, and target exists, skip.
						shouldCopy = false;
						if (showLog) {
							console.log(`COPY_DIR: Target "${action.target}" already exists and overwrite is not enabled.`);
						}
					}
				}

				if (shouldCopy) {
					if (!dryRun) {
						await fs.copy(action.dir, action.target, { overwrite: overwriteOption });
					}
					if (showLog) {
						console.log(`COPY_DIR: ${action.dir} -> ${action.target}`);
					}
				}
				break;
			}
			case "COPY_FILE": {
				if (!(await fs.pathExists(action.file))) {
					// not exists, skip
					if (showLog) {
						console.log(`COPY_FILE: Source file "${action.file}" does not exist, skipping...`);
					}
					return;
				}

				const targetExists = await fs.pathExists(action.target);
				let shouldCopy = true;
				let overwriteOption = action.overwrite === true; // Default to true if explicitly set

				if (!dryRun && targetExists) {
					if (action.overwrite === "ask") {
						// TODO: Separate Logic
						const answer = await p.confirm({
							message: `Target "${action.target}" already exists. Overwrite?`,
						});
						if (answer) overwriteOption = true;
						else shouldCopy = false;
					} else if (action.overwrite === "backup") {
						const backupPath = await getBackupPath(action.target);
						if (showLog) {
							console.log(`COPY_FILE: Renaming existing "${action.target}" to "${backupPath}"`);
						}
						await fs.move(action.target, backupPath);
						overwriteOption = false;
					} else if (overwriteOption === false) {
						// If overwrite is false or undefined, and target exists, skip.
						shouldCopy = false;
						if (showLog) {
							console.log(`COPY_FILE: Target "${action.target}" already exists and overwrite is not enabled.`);
						}
					}
				}

				if (shouldCopy) {
					if (!dryRun) {
						await fs.copy(action.file, action.target, { overwrite: overwriteOption });
					}
					if (showLog) {
						console.log(`COPY_FILE: ${action.file} -> ${action.target}`);
					}
				}
				break;
			}
			case "COPY_TEMPLATE_DIR":
				await copyTemplateDir(action.dir, action.target, action.data, { dryRun, verbose });
				break;
			case "COPY_TEMPLATE_FILE":
				await copyTemplateFile(action.file, action.target, action.data, {
					dryRun,
					verbose,
					templatePath: action.templatePath,
				});
				break;
			case "DELETE_FILE":
				if (!dryRun) {
					await fs.remove(action.path);
				}
				if (showLog) {
					console.log(`DELETE_FILE: ${action.path}`);
				}
				break;
			case "DELETE_DIR":
				if (!dryRun) {
					await fs.remove(action.path);
				}
				if (showLog) {
					console.log(`DELETE_DIR: ${action.path}`);
				}
				break;
			case "RUN_COMMAND":
				if (!dryRun) {
					await promisifyExec(action.command, { cwd: action.cwd });
				}
				if (showLog) {
					console.log(`RUN_COMMAND: ${action.command}, cwd: ${action.cwd}`);
				}
				break;
			default:
				throw new Error(`Unknown action: ${action}`);
		}
	}
};
