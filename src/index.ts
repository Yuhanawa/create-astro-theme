import path from "node:path";
import { select } from "@clack/prompts";
import type { z } from "zod";
import { getDefaultValueString } from "./utils/defaultValue";
import * as fs from "./utils/fs-wrapper";
import { c } from "./utils/prompts";

type configType =
	| {
			config: { file: string } | { content: string } | { jsonObject: object };
			contents?: { files: string[] } | { dir: string } | { contents: { filename: string; content: string }[] };
	  }
	| undefined;

export async function initConfig(
	packageName: string,
	configSchema: z.AnyZodObject,
	defaultConfigs?: {
		minimal?: configType;
		recommended?: configType;
		[key: string]: configType;
	},
	options?: {
		dryRun?: boolean;
		cwd?: string;
	},
) {
	// biome-ignore lint/suspicious:
	((globalThis as any).dryRun = options?.dryRun ?? false) &&
		console.log("🚀 Dry Run: Run through without making any changes");

	// biome-ignore lint/style:
	defaultConfigs ??= {};
	defaultConfigs.minimal ??= { config: { content: getDefaultValueString(configSchema) } };
	console.log(defaultConfigs);

	const defaultConfigsKeys = Object.keys(defaultConfigs);

	const cwd = options?.cwd ?? process.cwd();
	const userPackagePath = path.join(cwd, "package.json");
	console.log(userPackagePath);

	if (!fs.existsSync(userPackagePath)) {
		console.error("❌ package.json not found");
		process.exit(1);
	}

	const userPackageJsonString = fs.readFileSync(userPackagePath, "utf-8");
	const userPackageJson = JSON.parse(userPackageJsonString);
	if (!userPackageJson.dependencies?.[packageName]) {
		console.error(`❌ ${packageName} not found in package.json`);
		console.error(`❕Please run "npm astro add ${packageName}" first`);
		process.exit(1);
	}

	const astroConfigFiles = [
		"astro.config.ts",
		"astro.config.mts",
		"astro.config.cts",
		"astro.config.js",
		"astro.config.mjs",
		"astro.config.cjs",
	];
	const astroConfigFile = astroConfigFiles.find((file) => fs.existsSync(path.join(cwd, file)));
	if (!astroConfigFile) {
		console.error("❌ astro.config.[cjs|mts|cts|js|mjs] not found");
		process.exit(1);
	}

	const astroConfigFilePath = path.join(cwd, astroConfigFile);
	const astroConfigString = fs.readFileSync(astroConfigFilePath, "utf-8");

	// get package from `import package from "{packageName}"`;
	const packageImportRegex = new RegExp(`import\\s+([\\w\\d_]+)\\s+from\\s+['"]${packageName}['"]`);
	const packageImportName = astroConfigString.match(packageImportRegex)?.[1];

	const entryThemeConfigRegex = new RegExp(`${packageImportName}\\s*\\((\\s*|\\s*{\\s*}\\s*)\\)`);
	const anyThemeConfigRegex = new RegExp(`${packageImportName}\\s*\\(([^)]*)\\)`);
	const EntryThemeConfigArea = astroConfigString.match(entryThemeConfigRegex)?.[1];
	const AnyThemeConfigArea = astroConfigString.match(anyThemeConfigRegex)?.[1];
	if (
		!["defineConfig", "integrations", packageName].some((key) => astroConfigString.includes(key)) ||
		!packageImportName ||
		!AnyThemeConfigArea
	) {
		console.error(`❌ package not found in ${astroConfigFile}`);
		console.error(`❕Please run "npm astro add ${packageName}" first`);
		process.exit(1);
	}

	if (EntryThemeConfigArea !== AnyThemeConfigArea) {
		console.error(`❌ Theme(${packageName}) already has been configured`);
		console.error(
			`❕ If you want to Re-Initialize the theme, please remove the theme configuration in ${astroConfigFile}`,
		);
		console.error(`❕ Just keep "${packageImportName}()" and run "npm ${packageName} init" again`);
		process.exit(1);
	}

	const configKey = await c(
		select({
			message: "Select a config",
			options: defaultConfigsKeys.map((key) => ({ value: key, label: key })),
			initialValue: defaultConfigsKeys.includes("recommended") ? "recommended" : "minimal",
		}),
	);

	// biome-ignore lint/style/noNonNullAssertion: couldn't be null
	const config = defaultConfigs[configKey]!.config;
	const configString = Object.entries({
		file: (i: string) => fs.readFileSync(i, "utf-8"),
		content: (i: string) => i,
		jsonObject: (i: object) => JSON.stringify(i, null, 2),
	})
		.map(([key, value]) => key in config && value(config[key as keyof typeof config]))
		.find(Boolean);

	const newAstroConfigString = astroConfigString.replace(EntryThemeConfigArea, `\nconfig: ${configString}\n`);
	fs.writeFileSync(astroConfigFilePath, newAstroConfigString);
	console.log("done");
}
