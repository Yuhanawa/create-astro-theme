export const versions = {
	astro: "5.14.1",
	astroThemeProvider: "0.7.1",
};

export type CreateTemplateData = {
	versions: typeof versions;
	projectName: string;
	themeName: string;
};
export type UseTemplateData = {
	versions: typeof versions;
	projectName: string;
	themeName: string;
	themeVersion: string;
};
