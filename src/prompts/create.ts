import * as p from "@clack/prompts";
import { kebabCase } from "change-case";
import fs from "fs-extra";
import { type CreateCommandConfig, createCommandDefaultConfig } from "../config";
import { pwc } from "../utils/promptUtils";
import type { OptionalProperty } from "../utils/typeUtils";

const prompt = async (
	optionalConfig: OptionalProperty<CreateCommandConfig>,
): Promise<OptionalProperty<CreateCommandConfig>> => {
	const showLog = (optionalConfig.dryRun || optionalConfig.verbose) ?? false;
	if (optionalConfig.skip) {
		if (showLog) p.log.info("Skipping prompts...");
		return optionalConfig;
	}

	p.intro("Create a new theme project");

	const projectName =
		optionalConfig.projectName ||
		(await pwc(() =>
			p.text({
				message: "Project Name:",
				defaultValue: optionalConfig.themeName || createCommandDefaultConfig.themeName,
				placeholder: optionalConfig.projectName || createCommandDefaultConfig.themeName,
				validate: (name) => {
					if (name.match(/[^\w\d\s\-_]/g))
						return "Only can contain letters, numbers, hyphens, and underscores, spaces will be auto replaced";
				},
			}),
		));

	if ((await fs.exists(projectName)) && (await fs.readdir(projectName)).length > 0) {
		p.log.error(`Directory ${projectName} already exists and is not empty`);
		process.exit(1);
	}

	const themeName =
		optionalConfig.themeName ||
		(await pwc(() =>
			p.text({
				message: "Theme Name:",
				defaultValue: projectName ?? createCommandDefaultConfig.projectName,
				placeholder: projectName ?? createCommandDefaultConfig.projectName,
				validate: (name) => {
					if (name.match(/[^\w\d\s\-_]/g))
						return "Only can contain letters, numbers, hyphens, and underscores, spaces will be auto replaced";
				},
			}),
		));

	p.log.info(`Creating project... Project name: ${projectName}, Theme name: ${themeName}`);

	const config: CreateCommandConfig = {
		...optionalConfig,
		projectName: kebabCase(projectName),
		themeName: kebabCase(themeName),
	};

	return config;
};

const endPrompt = (config: CreateCommandConfig) => {
	p.log.info("Creation complete!");
	p.note(`Next steps:\n1. cd ${config.projectName}\n2. pnpm install\n3. pnpm run ${config.themeName}-playground:dev`);
	p.outro("Enjoy!");
};

export default { prompt, endPrompt };
