import { defineConfig } from "tsdown";

export default defineConfig([
	{
		entry: ["./src/index.ts"],
		platform: "neutral",
		dts: true,
		sourcemap: true,
		external: ["templates"],
		ignoreWatch: ["templates"],
		minify: true,
	},
]);
