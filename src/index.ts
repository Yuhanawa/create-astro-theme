#!/usr/bin/env node
import * as p from "@clack/prompts";
import { program } from "commander";
import { version } from "./../package.json";
import commands from "./commands";
import { registerCaseHelper } from "./utils/handlebarsUtils";

registerCaseHelper();
const firstArg = process.argv[2];
if (!["create", "new", "use", "with", "help"].includes(firstArg)) {
	program
		.description("")
		// .option("--dry-run", "Dry run")
		// .option("--verbose", "Verbose mode")
		.action(async (options) => {
			const commandPrompt = await p.select({
				message: "What do you want to do?",
				options: [
					{ value: "use", label: "Create project using theme", hint: "As theme user" },
					{ value: "create", label: "Create a new theme", hint: "As theme creator" },
				],
			});
			if (p.isCancel(commandPrompt)) {
				p.cancel("Operation cancelled.");
				process.exit(0);
			}

			const config = {
				dryRun: options.dryRun,
				verbose: options.verbose,
			};

			if (commandPrompt === "use") {
				await commands.use.run(config);
			} else if (commandPrompt === "create") {
				await commands.create.run(config);
			} else {
				console.error("What's happening?");
				console.error(`Unknown command: ${commandPrompt}`);
				process.exit(1);
			}
		});
} else {
	program
		.command("create [name]")
		.aliases(["new"])
		.description("Create a new theme")
		.option("--dry-run", "Dry run")
		.option("--verbose", "Verbose mode")
		.option("--skip", "Use recommended or default settings and skip prompts")
		.option("--project-name <projectName>", "Specify project name, defaults to [name]")
		.option("--theme-name <themeName>", "Specify theme name, defaults to [name]")
		.action(async (name, options) => {
			await commands.create.run({
				dryRun: options.dryRun,
				verbose: options.verbose,
				skip: options.skip,
				name,
				projectName: options.projectName ?? name,
				themeName: options.themeName ?? name,
			});
		});

	program
		.command("use <theme>")
		.aliases(["with"])
		.option("--dry-run", "Dry run")
		.option("--verbose", "Verbose mode")
		.option("--skip", "Use recommended or default settings and skip prompts")
		.option("--project-name <projectName>", "The name of the project to create.")
		.description("Use a template")
		.action(async (theme, options) => {
			await commands.use.run({
				dryRun: options.dryRun,
				verbose: options.verbose,
				skip: options.skip,
				themeName: theme,
				projectName: options.projectName,
			});
		});
}
program.version(version).parse(process.argv);
