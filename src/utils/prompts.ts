import { cancel, confirm, group, intro, isCancel, multiselect, outro, select, text } from "@clack/prompts";

// I hate this
// It could have used "group" instead, but by the time I realized that, it was too late, I had already written
export async function c<T>(value: Promise<T | symbol>): Promise<T> {
	const result = await value;
	if (isCancel(result)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}
	return result;
}

export const initGit = () =>
	c(
		confirm({
			message: "Initialize git repo?",
		}),
	);

export const installDependencies = () =>
	c(
		confirm({
			message: "Install dependencies?",
		}),
	);

export const npm = () =>
	c(
		select({
			message: "Use NPM?",
			options: [
				{ value: "pnpm", label: "PNPM", hint: "(recommended)" },
				{ value: "npm", label: "NPM" },
			],
			initialValue: "pnpm",
		}),
	);

export const actionType = (inProject: boolean) =>
	c(
		select({
			message: "What do you want to do?",
			options: [
				{
					value: "project",
					label: `new project and theme ${!inProject ? "(recommended)" : ""}`,
				},
				{
					value: "theme",
					label: `new theme ${inProject ? "(recommended)" : ""}`,
					hint: `in this project ${inProject ? "" : "or directory"}`,
				},
				// { value: "install", label: "I just want to create a website with my favorite theme" },
			],
			initialValue: inProject ? "theme" : "project",
		}),
	);

export const themeName = () =>
	c(
		text({
			message: "Theme Name: ",
			placeholder: "my-astro-theme",
			defaultValue: "my-astro-theme",
			validate: (themeName) => {
				if (themeName.match(/[^\w\d\s\-_]/g))
					return "Theme name can only contain letters, numbers, hyphens, and underscores, spaces will be replaced with hyphens";
			},
		}),
	);
export const projectName = (defaultValue: string) =>
	c(
		text({
			message: "Project Name: ",
			placeholder: defaultValue,
			defaultValue: defaultValue,
			validate: (projectName) => {
				if (projectName.match(/[^\w\d\-_]/g))
					return "Project name can only contain letters, numbers, hyphens, and underscores";
			},
		}),
	);

export const structure = (inProject: boolean, hasPackageOrPlayground: boolean) =>
	c(
		select({
			message: "Structure: ",
			options: [
				!hasPackageOrPlayground && {
					value: "single",
					label: "package + playground (recommended)",
					hint: "applicable to projects with only a single theme",
				},
				{
					value: "multi",
					label: "theme-package + theme-playground (recommended)",
					hint: "applicable to projects with multiple themes",
				},
				{
					value: "single-playground",
					label: "theme-package + playground",
					hint: "applicable to minimal themes with only a single playground",
				},
			].filter((i) => !!i),
			initialValue: inProject ? "multi" : "single",
		}),
	);
