// import * as p from '@clack/prompts';

import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";
import { findUpSync } from "find-up";
import fs from "fs-extra";
import Handlebars from "handlebars";

function getProjectRoot() {
	const packageJsonPath = findUpSync("package.json", {
		type: "file",
		cwd: path.dirname(fileURLToPath(import.meta.url)),
	});
	if (!packageJsonPath) {
		throw new Error("Could not find package.json");
	}
	return path.dirname(packageJsonPath);
}

const projectRoot = getProjectRoot();
const _templatePath = path.join(projectRoot, "templates");

// const log = p.log.info;
const log = console.log;

export const copyTemplateFile = async (
	file: string,
	target: string,
	// biome-ignore lint/suspicious/noExplicitAny: suppress
	data?: Record<string, any>,
	config?: { templatePath?: string; dryRun?: boolean; verbose?: boolean; logPrefix?: string },
) => {
	const showLog = (config?.dryRun || config?.verbose) ?? false;
	const prefix = config?.logPrefix ?? "";
	if (showLog) {
		log(`${prefix}COPY_TEMPLATE_FILE: ${file} -> ${target}, data: ${JSON.stringify(data)}`);
	}

	const template = config?.templatePath ?? _templatePath;
	const sourcePath = path.join(template, file);

	file = file
		.split("\\")
		.map((f) => (f.startsWith("_") ? f.slice(1) : f))
		.join("\\");
	file = file
		.split("/")
		.map((f) => (f.startsWith("_") ? f.slice(1) : f))
		.join("/");
	const isEmpty = file.endsWith("\\") || file.endsWith("/");
	const isHbs = file.endsWith(".hbs");
	if (isHbs) file = file.slice(0, -4);

	const renderedFileName = Handlebars.compile(file.replaceAll("\\", "\\\\"))(data);
	const destPath = path.join(target, renderedFileName);

	if (!config?.dryRun) {
		await fs.ensureDir(path.dirname(destPath));
	}
	if (showLog) log(`${prefix}[COPY_TEMPLATE_FILE(${file} -> ${target})] ensureDir:${path.dirname(destPath)}`);

	if (isEmpty) return;

	if (isHbs) {
		const templateContent = await fs.readFile(sourcePath, "utf-8");
		const finalContent = Handlebars.compile(templateContent)(data);
		if (!config?.dryRun) {
			await fs.writeFile(destPath, finalContent);
		}
		if (showLog) {
			log(
				`${prefix}[COPY_TEMPLATE_FILE(${file} -> ${target})] writeFile:${destPath}, content: (next line)\n${finalContent}`,
			);
		}
	} else {
		if (!config?.dryRun) {
			await fs.copyFile(sourcePath, destPath);
		}
		if (showLog) {
			log(`${prefix}[COPY_TEMPLATE_FILE(${file} -> ${target})] copyFile:${sourcePath} -> ${destPath}`);
		}
	}
};

export const copyTemplateDir = async (
	dir: string,
	target: string,
	// biome-ignore lint/suspicious/noExplicitAny: suppress
	data?: Record<string, any>,
	config?: { templatePath?: string; dryRun?: boolean; verbose?: boolean; logPrefix?: string },
) => {
	const showLog = (config?.dryRun || config?.verbose) ?? false;
	const prefix = config?.logPrefix ?? "";
	if (showLog) {
		log(`${prefix}COPY_TEMPLATE_DIR: ${dir} -> ${target}, data: ${JSON.stringify(data)}`);
	}
	const dirTemplatePath = path.join(config?.templatePath ?? _templatePath, dir);
	const files = await fg.glob("**/*", { cwd: dirTemplatePath });

	for (const file of files) {
		// const relativePath = path.join(file);
		await copyTemplateFile(file, target, data, {
			...config,
			templatePath: dirTemplatePath,
			logPrefix: `${prefix ?? ""}[COPY_TEMPLATE_DIR(${dir} -> ${target})]`,
		});
	}
};
