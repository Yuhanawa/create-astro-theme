export type CreateCommandConfig = {
	dryRun?: boolean;
	verbose?: boolean;
	skip?: boolean;
	name?: string;
	projectName: string;
	themeName: string;
};

export type UseCommandConfig = {
	dryRun?: boolean;
	verbose?: boolean;
	skip?: boolean;
	projectName: string;
	themeName: string;
	themeVersion: string;
};

export const createCommandDefaultConfig: CreateCommandConfig = {
	projectName: "my-theme",
	themeName: "my-theme",
};
export const useCommandDefaultConfig: UseCommandConfig = {
	projectName: "my-website",
	themeName: "astro-charm", // cloud NOT be empty, use `astro-charm` as placeholder
	themeVersion: "1.2.4", // automatically fetch from package.json, here use the version of `astro-charm` as placeholder
};
