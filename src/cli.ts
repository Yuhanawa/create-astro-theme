#!/usr/bin/env node

import path from "node:path";
import { confirm, intro, log, outro, spinner } from "@clack/prompts";
import { cac } from "cac";
import chalk from "chalk";
import packageJson from "../package.json";
import * as action from "./actions";
import initConfig from "./actions/initConfig";
import { camelCase, kebabCase } from "./utils/case";
import { setDryRun } from "./utils/dryRun";
import exec from "./utils/exec";
import * as fs from "./utils/fs-wrapper";
import * as p from "./utils/prompts";

const cli = cac("create-astro-theme");
cli.version(packageJson.version);
cli.option("--dry-run", "Show what would be done, but don't actually do it");

cli
	.command("", "Create a theme with Astro Theme Provider")
	.option("--new <type>", "new Project or Theme")
	.option("--git", "Initialize a git repository")
	.option("--install-dependencies", "Install dependencies")
	.action(async (options) => {
		intro("Create a new theme");

		const cwd = process.cwd();
		const inProject = fs.existsSync(path.join(cwd, "package.json"));
		const hasPackageOrPlayground =
			fs.existsSync(path.join(cwd, "package")) || fs.existsSync(path.join(cwd, "playground"));

		let actionType: string | null = null;
		if (options.new === "project") actionType = "project";
		else if (options.new === "theme") {
			if (!inProject) {
				log.error("You must be in a project to create a theme");
				process.exit(1);
			}
			actionType = "theme";
		}
		actionType ??= !inProject ? "project" : await p.c(p.actionType());

		const shouldNewProject = actionType === "project";

		const project = shouldNewProject ? await p.project() : null;
		const theme = await p.theme(project?.name, {
			hasPackageOrPlayground,
		});

		let initGit = null;
		const installDependencies = options.installDependencies ?? (await p.c(p.installDependencies()));
		let projectPath: string = cwd;

		const s = spinner();
		if (shouldNewProject) {
			initGit = options.git ?? (await p.c(p.initGit()));

			const projectNameKebabCase = kebabCase(project!.name);
			projectPath = path.join(cwd, projectNameKebabCase);

			s.start("Initializing...");

			await action.initProject(cwd, projectNameKebabCase);
		} else s.start("Initializing...");

		const structure = theme.structure;
		const themeNameKebabCase = kebabCase(theme.name);
		const themeDir =
			structure === "single"
				? "package"
				: structure === "multi-in-subdir"
					? themeNameKebabCase
					: `package-${themeNameKebabCase}`;
		const playgroundDir =
			structure === "single" || structure === "single-playground"
				? "playground"
				: structure === "multi-in-subdir"
					? themeNameKebabCase
					: `playground-${themeNameKebabCase}`;
		const playgroundName =
			structure === "single" || structure === "single-playground" ? "playground" : `playground-${themeNameKebabCase}`;

		await action.initTheme(
			projectPath,
			themeDir,
			theme.name,
			playgroundDir,
			playgroundName,
			"pnpm",
			structure === "multi-in-subdir",
		);

		if (initGit) await action.initGit(projectPath);
		if (installDependencies) await action.installDependencies(projectPath);

		log.info("");
		s.stop("Initialization complete!");
		outro("Done!");
	});

cli
	.command("with-theme <themeName> [websiteName]", "Create a website with your favorite theme")
	.option("--yes", "Skip prompts and use default values")
	.action(async (themeName, websiteName, options) => {
		intro("Create website with your favorite theme");
		// biome-ignore lint:
		websiteName ??= (await p.name("Website Name: ", "my-astro-website")).toString().trim().replace(/\s/g, "-");
		const projectPath = path.join(process.cwd(), websiteName);
		if (fs.existsAndNotEmpty(projectPath)) {
			log.error(`Directory ${websiteName} already exists and is not empty`);
			process.exit(1);
		}

		const s = spinner();
		s.start(`Creating website ${websiteName} with theme ${themeName} ...`);
		log.step(`Creating website ${websiteName} with theme ${themeName} ...`);

		exec(`pnpm create astro@latest ${websiteName} --template minimal --skip-houston --git --no-install -y`);

		fs.rmSync(path.join(projectPath, "src", "pages", "index.astro"));
		fs.rmSync(path.join(projectPath, "src", "pages"));
		fs.writeFileSync(
			path.join(projectPath, "src", "env.d.ts"),
			/*ts*/ `/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="../.astro/.d.ts" />
/// <reference types="../.astro/${themeName}.d.ts" />`,
		);
		fs.mkdirSync(path.join(projectPath, "src", "content"));

		exec(`pnpm add ${themeName}`, { cwd: projectPath });
		const importName = camelCase(themeName.replace(/^astro-?/gi, ""));
		const astroConfigPath = path.join(projectPath, "astro.config.mjs");

		fs.writeFileSync(
			astroConfigPath,
			/*ts*/ `// @ts-check
import { defineConfig } from 'astro/config';
import ${importName} from "${themeName}";

// https://astro.build/config
export default defineConfig({
	integrations: [${importName}()],
});`,
		);

		s.stop("Website created!");

		const modulePath = path.join(projectPath, "node_modules", themeName);
		const initConfigPath = path.join(modulePath, "init.config.json");

		if (fs.existsSync(initConfigPath)) {
			log.info(`Theme ${themeName} has "init.config.json", would you like to initialize it?`);
			const initConfigConfirm = await confirm({
				message: "Initialize config? (recommended)",
			});
			if (initConfigConfirm) {
				const initConfigString = fs.readFileSync(initConfigPath, "utf-8");
				const initConfigJson = JSON.parse(initConfigString);
				await initConfig(themeName, initConfigJson, {
					cwd: projectPath,
				});
			}
		}

		outro("Done!");
	});

cli
	.command("init <packageName>", "Initialize a theme")
	.option("--cwd <cwd>", "The current working directory")
	.option("--yes", "Skip prompts and use default values")
	.action(async (packageName, options) => {
		const cwd = options.cwd ?? process.cwd();
		const modulePath = path.join(cwd, "node_modules", packageName);
		const initConfigPath = path.join(modulePath, "init.config.json");
		if (!fs.existsSync(initConfigPath)) {
			console.error(`Could not find init.config.json for ${packageName}`);
			process.exit(1);
		}
		const initConfigString = fs.readFileSync(initConfigPath, "utf-8");
		const initConfigJson = JSON.parse(initConfigString);
		initConfig(packageName, initConfigJson, {
			cwd,
			useDefaultValues: options.yes,
		});
	});

try {
	const results = cli.parse(process.argv, { run: false });
	setDryRun(results.options.dryRun) && log.info(chalk.green("🚀 Dry Run: Run through without making any changes"));
	log.info("");
	await cli.runMatchedCommand();
} catch (error) {
	log.error("❌ Something went wrong!");
	console.error(error);
	if (error instanceof Error) {
		log.error(error.message);
		console.error(error.stack);
	}
	process.exit(1);
}
