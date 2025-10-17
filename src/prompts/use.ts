import * as p from "@clack/prompts";
import { kebabCase } from "change-case";
import fs from "fs-extra";
import packageJson, { PackageNotFoundError } from "package-json";
import { type UseCommandConfig, useCommandDefaultConfig } from "../config";
import { pwc } from "../utils/promptUtils";
import type { OptionalProperty } from "../utils/typeUtils";

const prompt = async (
	optionalConfig: OptionalProperty<UseCommandConfig>,
): Promise<OptionalProperty<UseCommandConfig>> => {
	const showLog = (optionalConfig.dryRun || optionalConfig.verbose) ?? false;
	if (optionalConfig.skip) {
		if (showLog) p.log.info("Skipping prompts...");
		return optionalConfig;
	}

	const themeName: string =
		optionalConfig.themeName ||
		(await pwc(() =>
			p.text({
				message: "Theme Name:",
				defaultValue: "",
				placeholder: "Please enter the package name of theme that you want to use",
				validate: (name) => {
					if (name.match(/[^\w\d\s\-_ ]/g)) return "Only can contain letters, numbers, hyphens, and underscores";
				},
			}),
		));

	p.log.step("Fetching theme information");
	p.log.info(`Fetching theme \`${themeName}\` information...`);
	let themeVersion: string;
	try {
		const themePackage = await packageJson(themeName);
		themeVersion = themePackage.version;
	} catch (e) {
		if (e instanceof PackageNotFoundError) {
			p.log.error(`Theme ${themeName} not found`);
			throw new Error(`Theme ${themeName} not found`);
		} else {
			p.log.error(`Error fetching theme ${themeName}`);
			throw e;
		}
	}
	p.log.success(`Theme ${themeName} found, version: ${themeVersion}`);
	p.intro(`Creating a new project using theme(${themeName})`);
	p.log.step("Creating project");
	const projectName =
		optionalConfig.projectName ||
		(await pwc(() =>
			p.text({
				message: "Project Name:",
				defaultValue: useCommandDefaultConfig.projectName,
				placeholder: useCommandDefaultConfig.projectName,
				validate: (name) => {
					if (name.match(/[^\w\d\s\-_ ]/g)) return "Only can contain letters, numbers, hyphens, and underscores";
				},
			}),
		));

	if ((await fs.exists(projectName)) && (await fs.readdir(projectName)).length > 0) {
		p.log.error(`Directory ${projectName} already exists and is not empty`);
		process.exit(1);
	}

	p.log.step(`Creating project... Project name: ${projectName}, Using theme: ${themeName}`);
	p.log.message("It may take a while, please wait...");

	const config: UseCommandConfig = {
		projectName: kebabCase(projectName),
		themeName: themeName!,
		themeVersion: themeVersion,
		...optionalConfig,
	};
	return config;
};

const endPrompt = (config: UseCommandConfig) => {
	p.log.info("Creation complete!");
	p.note(
		`Next steps:\n1. cd ${config.projectName}\n2. pnpm install\n3. modify \`site\` to yours in \`astro.config.ts\`\n4.view and edit \`${config.themeName}.theme.ts\` if you want\n5. pnpm run dev`,
	);
	p.outro("Enjoy!");
};

export default { prompt, endPrompt };
