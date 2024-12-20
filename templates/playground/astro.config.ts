import { defineConfig } from "astro/config";
import {{ThemeNameCamelCase}} from "{{ThemeNameKebabCase}}";

export default defineConfig({
	integrations: [
		{{ThemeNameCamelCase}}({
			config: {
				title: "My Awesome Theme",
				description: "My awesome theme is currently under construction!",
			},
			pages: {

			},
			overrides: {
				
			}
		}),
	],
});
