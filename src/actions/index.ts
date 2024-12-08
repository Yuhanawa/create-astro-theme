import path, { join } from "node:path";
import { log } from "@clack/prompts";
import * as yaml from "yaml";
import exec from "../utils/exec";
import { copyTemplateWithReplacements, createDirStructure } from "../utils/template";
import * as fs from "./../utils/fs-wrapper";

export function initGit(path: string) {
	exec("git init", { cwd: path });
	fs.copyFileSync(`${__dirname}/../templates/.gitignore`, `${path}/.gitignore`);
}

export function initProject(BasePath: string, projectNameKebab: string) {
	const projectPath = path.join(BasePath, projectNameKebab);
	fs.mkdirSync(projectPath);

	const packageJson = {
		name: projectNameKebab,
		license: "MIT",
		private: true,
		scripts: {},
		devDependencies: {
			astro: "^4.13.1",
		},
	};

	fs.writeFileSync(`${projectPath}/package.json`, JSON.stringify(packageJson, null, 2));
	fs.copyFileSync(`${__dirname}/../templates/tsconfig.json`, `${projectPath}/tsconfig.json`);
}

export function initTheme(
	projectPath: string,
	themeDir: string,
	themeName: string,
	playgroundName: string | undefined,
	npm: string,
) {
	// theme
	const themePath = join(projectPath, themeDir);
	createDirStructure(themePath);

	const templatePath = join(__dirname, "../templates/package");

	copyTemplateWithReplacements(templatePath, themePath, {
		themeName,
	});

	// playground
	if (playgroundName) {
		const playgroundPath = join(projectPath, playgroundName);
		if (fs.existsSync(playgroundPath)) {
			log.info("Playground already exists, skipping creation");
			const playgroundPackageJson = JSON.parse(fs.readFileSync(`${playgroundPath}/package.json`, "utf-8"));
			playgroundPackageJson.dependencies[themeName] = "workspace:^";
			fs.writeFileSync(`${playgroundPath}/package.json`, JSON.stringify(playgroundPackageJson, null, 2));
		} else {
			const templatePath = join(__dirname, "../templates/playground");
			createDirStructure(playgroundPath);
			copyTemplateWithReplacements(templatePath, playgroundPath, {
				themeName,
				playgroundName,
			});
		}

		// main project
		let devCommand = "";
		if (npm === "npm") {
			devCommand = `npm -W ${playgroundName} dev`;
		} else if (npm === "pnpm") {
			devCommand = `pnpm --filter ${playgroundName} dev`;
			const pnpmWorkspaceYamlPath = `${projectPath}/pnpm-workspace.yaml`;
			if (fs.existsSync(pnpmWorkspaceYamlPath)) {
				const pnpmWorkspaceYaml = yaml.parse(fs.readFileSync(pnpmWorkspaceYamlPath, "utf-8"));
				pnpmWorkspaceYaml.packages.push(themeDir, playgroundName);
				fs.writeFileSync(pnpmWorkspaceYamlPath, yaml.stringify(pnpmWorkspaceYaml));
			} else {
				log.warn("Using pnpm, but pnpm workspace.yaml not found, creating it");
				fs.writeFileSync(
					pnpmWorkspaceYamlPath,
					yaml.stringify({
						packages: [themeDir, playgroundName],
					}),
				);
			}
		}
		// biome-ignore lint/suspicious/noExplicitAny: globalThis
		const dryRun = (globalThis as any).dryRun ?? false;
		if (dryRun) {
			log.info("[DryRun] [skip] read package.json and add script");
		} else {
			const packageExists = fs.existsSync(`${projectPath}/package.json`);
			if (packageExists) {
				const projectPackageJson = JSON.parse(fs.readFileSync(`${projectPath}/package.json`, "utf-8"));
				projectPackageJson.scripts[`${playgroundName}:dev`] = devCommand;
				fs.writeFileSync(`${projectPath}/package.json`, JSON.stringify(projectPackageJson, null, 2));
			} else {
				log.warn("package.json not found, skipping script addition");
			}
		}
	}
}
