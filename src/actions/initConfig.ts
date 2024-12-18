import path from "node:path";
import { log, select } from "@clack/prompts";
import * as fs from "../utils/fs-wrapper";
import { c } from "../utils/prompts";

function getAstroConfigFile(basePath: string) {
	return [
		"astro.config.ts",
		"astro.config.mts",
		"astro.config.cts",
		"astro.config.js",
		"astro.config.mjs",
		"astro.config.cjs",
	].find((file) => fs.existsSync(path.join(basePath, file)));
}

type configType =
	| {
			config: { file: string } | { content: string } | { jsonObject: object };
			contents?: { files: string[] } | { dir: string } | { contents: { filename: string; content: string }[] };
	  }
	| undefined;

export default async function initConfig(
	packageName: string,
	defaultConfigs: {
		[key: string]: configType;
	},
	options?: {
		cwd?: string;
		useDefaultValues?: boolean;
	},
) {
	if (!defaultConfigs || Object.keys(defaultConfigs).length === 0) {
		log.error("❌ defaultConfigs is empty");
		process.exit(1);
	}

	const defaultConfigsKeys = Object.keys(defaultConfigs);
	const cwd = options?.cwd ?? process.cwd();
	const userPackagePath = path.join(cwd, "package.json");

	if (!fs.existsSync(userPackagePath)) {
		log.error("❌ package.json not found");
		process.exit(1);
	}

	const userPackageJsonString = fs.readFileSync(userPackagePath, "utf-8");
	const userPackageJson = JSON.parse(userPackageJsonString);
	if (!userPackageJson.dependencies?.[packageName]) {
		log.error(`❌ ${packageName} not found in package.json`);
		log.error(`❕Please run "npm astro add ${packageName}" first`);
		process.exit(1);
	}

	const astroConfigFile = getAstroConfigFile(cwd);
	if (!astroConfigFile) {
		log.error("❌ astro.config.[cjs|mts|cts|js|mjs] not found");
		process.exit(1);
	}

	const astroConfigFilePath = path.join(cwd, astroConfigFile);
	const astroConfigString = fs.readFileSync(astroConfigFilePath, "utf-8");

	// get package from `import package from "{packageName}"`;
	const packageImportRegex = new RegExp(`import\\s+([\\w\\d_]+)\\s+from\\s+['"]${packageName}['"]`);
	const packageImportName = astroConfigString.match(packageImportRegex)?.[1];

	const entryThemeConfigRegex = new RegExp(`${packageImportName}\\s*\\((\\s*|\\s*{\\s*}\\s*)\\)`);
	const anyThemeConfigRegex = new RegExp(`${packageImportName}\\s*\\(([^)]*)\\)`);
	const entryThemeConfigMatchArea = astroConfigString.match(entryThemeConfigRegex)?.[0]?.trim();
	const anyThemeConfigMatchArea = astroConfigString.match(anyThemeConfigRegex)?.[0]?.trim();

	if (
		// biome-ignore format:
		!["defineConfig", "integrations", packageName].some((key) => astroConfigString.includes(key)) ||
		packageImportName === null || packageImportName === undefined ||
		!anyThemeConfigMatchArea
	) {
		log.error(`❌ package not found in ${astroConfigFile}`);
		log.error(`❕Please run "npm astro add ${packageName}" first`);
		process.exit(1);
	}

	if (entryThemeConfigMatchArea !== anyThemeConfigMatchArea) {
		log.error(`❌ Theme(${packageName}) already has been configured`);
		log.error(`❕ If you want to Re-Initialize the theme, please remove the theme configuration in ${astroConfigFile}`);
		log.error(`❕ Just keep "${packageImportName}()" and run "npm ${packageName} init" again`);
		process.exit(1);
	}

	// biome-ignore format:
	const configKey = options?.useDefaultValues
			? defaultConfigsKeys.includes("recommended")? "recommended"
			: defaultConfigsKeys.includes("minimal")? "minimal"
			: defaultConfigsKeys[0]
		: await c(select({
					message: "Select a config",
					options: defaultConfigsKeys.map((key) => ({ value: key, label: key })),
					initialValue: defaultConfigsKeys.includes("recommended")? "recommended"
							: defaultConfigsKeys.includes("minimal")? "minimal"
							: defaultConfigsKeys[0],
		}));

	const config = defaultConfigs[configKey]!.config;
	const configString = Object.entries({
		file: (i: string) => fs.readFileSync(i, "utf-8"),
		content: (i: string) => i,
		object: (i: object) => JSON.stringify(i, null, 2),
	})
		.map(([key, value]) => key in config && value(config[key as keyof typeof config]))
		.find(Boolean);

	const newEntryThemeConfigMatchArea = entryThemeConfigMatchArea.replace(
		entryThemeConfigMatchArea,
		`${packageImportName}({\nconfig: ${configString}\n})\n`,
	);
	const newAstroConfigString = astroConfigString.replace(entryThemeConfigMatchArea, newEntryThemeConfigMatchArea);
	fs.writeFileSync(astroConfigFilePath, newAstroConfigString);
	log.info("done");
}
