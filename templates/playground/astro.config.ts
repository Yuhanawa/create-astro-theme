import { defineConfig } from "astro/config";
import {{THEMENAMECAMELCASE}} from "{{THEMENAMEKEBABCASE}}";

export default defineConfig({
	integrations: [
		{{THEMENAMECAMELCASE}}({
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
