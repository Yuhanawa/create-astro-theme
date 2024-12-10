#!/usr/bin/env node

import path, { join } from "node:path";
import { cancel, confirm, intro, log, outro, spinner } from "@clack/prompts";
import { cac } from "cac";
import chalk from "chalk";
import packageJson from "../package.json";
import * as action from "./actions";
import initConfig from "./actions/initConfig";
import { kebabCase } from "./utils/case";
import { setDryRun } from "./utils/dryRun";
import exec from "./utils/exec";
import * as fs from "./utils/fs-wrapper";
import * as p from "./utils/prompts";

const cli = cac("create-astro-theme");
cli.version(packageJson.version);
cli.option("--dry-run", "Show what would be done, but don't actually do it");

cli
	.command("", "Create a theme with Astro Theme Provider")
	// .option("-y, --yes", "Skip prompts and use default values")
	.option("--git", "Initialize a git repository")
	.option("--install-dependencies", "Install dependencies")
	.action(async (options) => {
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

cli
	.command("with-theme <themeName> [websiteName]", "Create a website with your favorite theme")
	.option("--git", "Initialize a git repository")
	.option("--install-dependencies", "Install dependencies")
	.action(async (themeName, websiteName, options) => {
		intro("Create website with your favorite theme");
		// biome-ignore lint:
		websiteName ??= (await p.websiteName()).toString().trim().replace(/\s/g, "-");
		const projectPath = path.join(process.cwd(), websiteName);
		if (fs.existsAndNotEmpty(projectPath)) {
			log.error(`Directory ${websiteName} already exists and is not empty`);
			process.exit(1);
		}

		const git = options.git ?? (await p.initGit());
		const installDependencies = options.installDependencies ?? (await p.installDependencies());
		const command = [
			"pnpm create astro@latest",
			websiteName,
			"--template minimal",
			`--add ${themeName}`,
			"--skip-houston",
			git && "--git",
			installDependencies && "--install",
			"-y",
		]
			.filter(Boolean)
			.join(" ");

		const s = spinner();
		s.start(`Creating website ${websiteName} with theme ${themeName} ...`);
		log.step(`Creating website ${websiteName} with theme ${themeName} ...`);

		try {
			const code = `import { init } from "${themeName}";init();`;
			exec(`npx tsx -e "${code}"`, { cwd: websiteName });
		} catch (error) {
			console.warn(error);
		}

		exec(command);

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
				initConfig(themeName, initConfigJson, {
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
