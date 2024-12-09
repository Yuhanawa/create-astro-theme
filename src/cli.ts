#!/usr/bin/env node

import path from "node:path";
import { cancel, confirm, intro, log, outro, spinner } from "@clack/prompts";
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
	.option("--git", "Initialize a git repository")
	.option("--install-dependencies", "Install dependencies")
	.action(async (options) => {
		// biome-ignore lint/suspicious: globalThis
		((globalThis as any).dryRun = (options.dryRun as boolean) ?? false) &&
			log.info(chalk.green("🚀 Dry Run: Run through without making any changes"));

		log.info("");
		intro("Create Astro Theme With Astro Theme Provider");

		const inProject = fs.existsSync(path.join(process.cwd(), "package.json"));
		const hasPnpmWorkspace = fs.existsSync(path.join(process.cwd(), "pnpm-workspace.yaml"));
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
		const packageIsProject = fs.existsSync(path.join(process.cwd(), "package", "package.json"));
		const playgroundIsProject = fs.existsSync(path.join(process.cwd(), "playground", "package.json"));

		const themeName = (await p.themeName()).toString().trim().replace(/\s/g, "-");
		const themeNameKebabCase = kebabCase(themeName);
		const structure = await p.structure(themeNameKebabCase, {
			inProject,
			hasPackageOrPlayground,
			packageIsProject,
			playgroundIsProject,
		});
		const npm = inProject && hasPnpmWorkspace ? "pnpm" : await p.npm();
		const initGit = (options.git ?? actionType === "project") ? await p.initGit() : false;
		const installDependencies = options.installDependencies ?? (await p.installDependencies());

		const s = spinner();
		let projectPath: string;
		if (actionType === "project") {
			let projectName = `${themeName}-root`;
			if (structure === "single")
				log.info(`We will use ${projectName} as the project name and use ${themeName} as the theme name`);
			else projectName = (await p.projectName(projectName)).toString().trim();

			log.step("Initializing project...");
			s.start("Initializing project...");

			const projectNameKebabCase = kebabCase(projectName);
			action.initProject(process.cwd(), projectNameKebabCase);
			log.success("Project initialized!");

			projectPath = path.join(process.cwd(), projectNameKebabCase);
		} else if (actionType === "theme") {
			projectPath = path.join(process.cwd());

			s.start("Initializing theme...");
		} else throw new Error("Unknown action type"); // could not happen

		const themeDir =
			structure === "single" // structure === "single" only happens when actionType === "project"
				? "package"
				: structure === "multi-in-subdir"
					? themeNameKebabCase
					: `${themeNameKebabCase}-package`;
		const playgroundName =
			structure === "single" || structure === "single-playground"
				? "playground"
				: structure === "multi-in-subdir"
					? themeNameKebabCase
					: `${themeNameKebabCase}-playground`;
		log.step("Initializing theme...");
		s.message("Initializing theme...");
		action.initTheme(projectPath, themeDir, themeName, playgroundName, npm.toString(), structure === "multi-in-subdir");
		log.success("Theme initialized!");

		if (initGit) action.initGit(projectPath.toString());
		if (installDependencies) {
			s.message("Installing dependencies...");
			exec(`${npm.toString()} install`, { cwd: projectPath });
			log.success("Dependencies installed!");
		}

		log.info("");
		s.stop("Initialization complete!");
		outro("Done!");
	});

program
	.command("with-theme <themeName> [websiteName]")
	.option("--git", "Initialize a git repository")
	.option("--install-dependencies", "Install dependencies")
	.option("--dry-run", "Show what would be done, but don't actually do it")
	.action(async (themeName, websiteName, options) => {
		intro("Create website with your favorite theme");
		// biome-ignore lint:
		((globalThis as any).dryRun = (options.dryRun as boolean) ?? false) &&
			log.info(chalk.green("🚀 Dry Run: Run through without making any changes"));
		// biome-ignore lint:
		websiteName ??= (await p.websiteName()).toString().trim().replace(/\s/g, "-");
		const git = options.git ?? (await p.initGit());
		const installDependencies = options.installDependencies ?? (await p.installDependencies());
		const command = [
			"pnpm create astro@latest",
			websiteName,
			"--template minimal",
			`--add ${themeName}`,
			"--skip-houston",
			git ? "--git" : "",
			installDependencies ? "--install-dependencies" : "",
			"-y",
		]
			.filter(Boolean)
			.join(" ");

		exec(command);

		outro("Done!");
	});

program.parse(process.argv);
