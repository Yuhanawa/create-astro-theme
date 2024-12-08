#!/usr/bin/env node

import path from "node:path";
import { cancel, confirm, intro, outro, spinner } from "@clack/prompts";
import { log } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import packageJson from "../package.json";
import * as action from "./actions";
import { kebabCase } from "./utils/case";
import exec from "./utils/exec";
import * as fs from "./utils/fs-wrapper";
import * as p from "./utils/prompts";

const program = new Command();

program
	.name("create-astro-theme")
	.version(packageJson.version)
	.description("A CLI tool to bootstrap your project")
	// .option("-y, --yes", "Skip prompts and use default values")
	.option("--dry-run", "Show what would be done, but don't actually do it")
	.action(async (options) => {
		const { dryRun } = options;
		// biome-ignore lint/suspicious: globalThis
		((globalThis as any).dryRun = (dryRun as boolean) ?? false) &&
			log.info(chalk.green("🚀 Dry Run: Run through without making any changes"));

		log.info("");
		intro("Create Astro Theme With Astro Theme Provider");

		const inProject = fs.existsSync(path.join(process.cwd(), "package.json"));
		const actionType = await p.actionType(inProject);

		if (!inProject && actionType === "theme") {
			const shouldContinue = await confirm({
				message:
					"It looks like you're not in a project, you might want to create a `new project and theme with Astro Theme Provider`, Are you sure continue to create a theme in this directory?",
			});
			if (!shouldContinue) cancel();
		}

		const hasPackageOrPlayground =
			fs.existsSync(path.join(process.cwd(), "package")) || fs.existsSync(path.join(process.cwd(), "playground"));
		const themeName = (await p.themeName()).toString().trim().replace(/\s/g, "-");
		const structure = await p.structure(inProject, hasPackageOrPlayground);
		const npm = await p.npm();
		const initGit = actionType === "project" ? await p.initGit() : false;
		const installDependencies = await p.installDependencies();

		const s = spinner();

		let projectPath: string;

		if (actionType === "project") {
			let projectName = `${themeName}-root`;
			if (structure === "single")
				log.info(`We will use ${projectName} as the project name and use ${themeName} as the theme name`);
			else if (structure === "multi" || structure === "single-playground")
				projectName = (await p.projectName(projectName)).toString().trim();

			s.start("Initializing project...");

			const projectNameKebabCase = kebabCase(projectName);
			action.initProject(process.cwd(), projectNameKebabCase);

			projectPath = path.join(process.cwd(), projectNameKebabCase);
		} else if (actionType === "theme") {
			s.start("Initializing theme...");

			projectPath = path.join(process.cwd());
		} else throw new Error("Unknown action type"); // could not happen

		const themeNameKebabCase = kebabCase(themeName);
		const themeDir = structure === "single" ? "package" : `${themeNameKebabCase}-package`; // structure === "single" only happens when actionType === "project"
		const playgroundName = structure === "multi" ? `${themeNameKebabCase}-playground` : "playground";

		action.initTheme(projectPath, themeDir, themeName, playgroundName, npm.toString());

		if (initGit) action.initGit(projectPath.toString());
		if (installDependencies) {
			s.message("Installing dependencies...");
			exec(`${npm.toString()} install`, { cwd: projectPath });
		}

		s.stop("Initialization complete!");
		log.info("");

		outro("Done!");
	});

program.parse(process.argv);
