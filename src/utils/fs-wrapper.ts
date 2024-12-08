import fs from "node:fs";
import { log } from "@clack/prompts";

// biome-ignore lint/suspicious/noExplicitAny: globalThis
const dryRun = () => (globalThis as any).dryRun ?? false;

// biome-ignore lint/suspicious/noExplicitAny: allowed
export const mkdirSync = (path: string, ...args: any[]) => {
	if (dryRun()) {
		log.info(`[DryRun] create directory: ${path}`);
		return;
	}
	fs.mkdirSync(path, ...args);
};

export const writeFileSync = (
	file: fs.PathOrFileDescriptor,
	data: string | NodeJS.ArrayBufferView,
	options?: fs.WriteFileOptions,
) => {
	if (dryRun()) {
		if (["js", "ts", "json"].some((i) => file.toString().endsWith(i))) {
			log.info(`[DryRun] write file: ${file}, data: ${data}`);
		} else {
			log.info(`[DryRun] write file: ${file}`);
		}
		return;
	}
	fs.writeFileSync(file, data, options);
};

export const copyFileSync = (src: fs.PathLike, dest: fs.PathLike, mode?: number) => {
	if (dryRun()) {
		log.info(`[DryRun] copy file from ${src} to ${dest}`);
		return;
	}
	fs.copyFileSync(src, dest, mode);
};

export {
	readSync,
	readFileSync,
	readdirSync,
	existsSync,
	statSync,
} from "node:fs";
