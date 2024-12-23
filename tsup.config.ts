import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		cli: "src/cli.ts",
	},
	external: ["templates"],
	ignoreWatch: ["templates"],
	format: ["esm"],
	target: "node18",
	splitting: false,
	sourcemap: true,
	clean: true,
	dts: true,
	shims: true,
	treeshake: true,
	minify: true,
});
