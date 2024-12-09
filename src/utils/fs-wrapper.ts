import fs from "node:fs";
import { log } from "@clack/prompts";

// biome-ignore lint/suspicious/noExplicitAny: globalThis
const dryRun = () => (globalThis as any).dryRun ?? false;

export const mkdirSync = (path: string, options: fs.MakeDirectoryOptions = { recursive: true }) => {
	if (dryRun()) {
		log.info(`[DryRun] create directory: ${path}`);
		return;
	}
	try {
		fs.mkdirSync(path, options);
		// biome-ignore lint/suspicious/noExplicitAny: allowed any type error
	} catch (error: any) {
		log.error(`❌ Failed to create directory: ${path}`);
		log.error(error);
		throw error;
	}
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
	try {
		fs.writeFileSync(file, data, options);
		// biome-ignore lint/suspicious/noExplicitAny: allowed any type error
	} catch (error: any) {
		log.error(`❌ Failed to write file: ${file}`);
		log.error(error);
		throw error;
	}
};

export const copyFileSync = (src: fs.PathLike, dest: fs.PathLike, mode?: number) => {
	if (dryRun()) {
		log.info(`[DryRun] copy file from ${src} to ${dest}`);
		return;
	}
	try {
		fs.copyFileSync(src, dest, mode);
		// biome-ignore lint/suspicious/noExplicitAny:  allowed any type error
	} catch (error: any) {
		log.error(`❌ Failed to copy file from ${src} to ${dest}`);
		log.error(error);
		throw error;
	}
};

export {
	readSync,
	readFileSync,
	readdirSync,
	existsSync,
	statSync,
} from "node:fs";
