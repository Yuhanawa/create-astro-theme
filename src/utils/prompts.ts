import { cancel, confirm, group, isCancel, log, select, text } from "@clack/prompts";
import { kebabCase } from "./case";

export async function c<T>(value: Promise<T | symbol>): Promise<T> {
	const result = await value;
	if (isCancel(result)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}
	return result;
}

export const initGit = () =>
	confirm({
		message: "Initialize git repo?",
	});

export const installDependencies = () =>
	confirm({
		message: "Install dependencies?",
	});

export const actionType = () =>
	select({
		message: "What do you want to do?",
		options: [
			{
				value: "theme",
				label: "new theme",
				hint: "in this project",
			},
			{
				value: "project",
				label: "new project and theme",
			},
		],
		initialValue: "theme",
	});

export const name = (message: string, defaultValue: string, placeholder?: string) =>
	text({
		message,
		defaultValue,
		placeholder: placeholder ?? defaultValue,
		validate: (name) => {
			if (name.match(/[^\w\d\s\-_]/g))
				return "Only can contain letters, numbers, hyphens, and underscores, spaces will be replaced with hyphens";
		},
	}).then((i) => i.toString().trim().replace(/\s/g, "-"));

export const project = () =>
	group(
		{
			name: () => name("Project Name: ", "my-astro-project"),
		},
		{
			onCancel: ({ results }) => {
				cancel("Operation cancelled.");
				process.exit(0);
			},
		},
	);

export const theme = (
	// biome-ignore lint/style/useDefaultParameterLast: <explanation>
	defaultValue = "my-astro-theme",
	{
		hasPackageOrPlayground,
	}: {
		hasPackageOrPlayground: boolean;
	},
) =>
	group(
		{
			name: () => name("Theme Name: ", defaultValue),
			structure: ({ results }) => {
				const name = kebabCase(results.name!);

				return select({
					message: "Structure: ",
					options: [
						!hasPackageOrPlayground && {
							value: "single",
							label: "package + playground (recommended)",
							hint: "applicable to projects with only a single theme",
						},
						{
							value: "multi-in-subdir",
							label: `packages/${name} + playgrounds/${name} (recommended)`,
							hint: "applicable to projects with multiple themes",
						},
						{
							value: "multi-in-root",
							label: `${name}-package + ${name}-playground`,
							hint: "applicable to projects with multiple themes",
						},
						{
							value: "single-playground",
							label: `${name}-package + playground`,
							hint: "applicable to minimal themes with only a single playground",
						},
					].filter((i) => !!i),
					initialValue: hasPackageOrPlayground ? "multi-in-subdir" : "single",
				});
			},
		},
		{
			onCancel: ({ results }) => {
				cancel("Operation cancelled.");
				process.exit(0);
			},
		},
	);
