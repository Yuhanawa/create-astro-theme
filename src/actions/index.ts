import { join } from "node:path";
import { log, tasks } from "@clack/prompts";
import * as yaml from "yaml";
import { getDryRun } from "../utils/dryRun";
import exec from "../utils/exec";
import { copyTemplateWithReplacements, createDirStructure } from "../utils/template";
import * as fs from "./../utils/fs-wrapper";

export function initGit(path: string) {
	return tasks([
		{
			title: "Initializing git",
			task: async (message) => {
				exec("git init", { cwd: path });
				fs.copyFileSync(`${__dirname}/../templates/.gitignore`, `${path}/.gitignore`);
				return "Initialized git";
			},
		},
	]);
}

export function installDependencies(path: string) {
	return tasks([
		{
			title: "Installing dependencies",
			task: async (message) => {
				log.step("Installing dependencies... it might take a while");
				exec("pnpm install", { cwd: path });
				return "Installed dependencies";
			},
		},
	]);
}

export function initProject(BasePath: string, projectNameKebab: string) {
	return tasks([
		{
			title: "Initializing project",
			task: async (message) => {
				const projectPath = join(BasePath, projectNameKebab);
				if (fs.existsAndNotEmpty(projectPath)) {
					log.error(`Project ${projectNameKebab} already exists`);
					process.exit(1);
				}
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
				return "Initialized project";
			},
		},
	]);
}

export function initTheme(
	projectPath: string,
	themeDir: string,
	themeName: string,
	playgroundDir: string,
	playgroundName: string,
	npm: string,
	useSubdir: boolean,
) {
	return tasks([
		{
			title: "Initializing theme",
			task: async (message) => {
				// theme
				const themePath = useSubdir ? join(projectPath, "packages", themeDir) : join(projectPath, themeDir);
				if (fs.existsAndNotEmpty(themePath)) {
					log.error(`Theme ${themeName} already exists`);
					process.exit(1);
				}
				createDirStructure(themePath);

				const templatePath = join(__dirname, "../templates/package");

				copyTemplateWithReplacements(templatePath, themePath, {
					themeName,
				});

				// playground
				const playgroundPath = useSubdir
					? join(projectPath, "playgrounds", playgroundDir)
					: join(projectPath, playgroundDir);
				if (fs.existsSync(playgroundPath) && fs.readdirSync(playgroundPath).length > 0) {
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
						if (!pnpmWorkspaceYaml.packages) pnpmWorkspaceYaml.packages = [];
						if (useSubdir) {
							if (!["packages/*", "packages\\*"].some((p) => pnpmWorkspaceYaml.packages.includes(p)))
								pnpmWorkspaceYaml.packages.push(`packages/${themeDir}`);
							if (!["playgrounds/*", "playgrounds\\*"].some((p) => pnpmWorkspaceYaml.packages.includes(p)))
								pnpmWorkspaceYaml.packages.push(`playgrounds/${playgroundDir}`);
						} else pnpmWorkspaceYaml.packages.push(themeDir, playgroundDir);

						fs.writeFileSync(pnpmWorkspaceYamlPath, yaml.stringify(pnpmWorkspaceYaml));
					} else {
						// Using pnpm, but pnpm workspace.yaml not found, creating it
						fs.writeFileSync(
							pnpmWorkspaceYamlPath,
							yaml.stringify({
								packages: useSubdir
									? [`packages/${themeDir}`, `playgrounds/${playgroundDir}`]
									: [themeDir, playgroundDir],
							}),
						);
					}
				}

				if (getDryRun()) {
					log.info("[DryRun] [skip] read package.json and add script");
				} else {
					const packageExists = fs.existsSync(`${projectPath}/package.json`);
					if (packageExists) {
						const projectPackageJson = JSON.parse(fs.readFileSync(`${projectPath}/package.json`, "utf-8"));
						projectPackageJson.scripts[`${playgroundDir}:dev`] = devCommand;
						fs.writeFileSync(`${projectPath}/package.json`, JSON.stringify(projectPackageJson, null, 2));
					} else {
						log.warn("package.json not found, skipping script addition");
					}
				}
				return "Initialized theme";
			},
		},
	]);
}
