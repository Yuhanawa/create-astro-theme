import path from "node:path";
import { getAllCase } from "./case";
import * as fs from "./fs-wrapper";

export function copyTemplateWithReplacements(
	templatePath: string,
	outputPath: string,
	replacements: Record<string, string>,
) {
	const allReplacements = getAllCase(replacements);

	const copyFile = (src: string, dest: string) => {
		const dirPath = path.dirname(dest);
		if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
		// biome-ignore format: common ext list
		if ([".js", ".ts", ".cjs", ".cts",".mjs", ".mts", ".jsx", ".tsx", ".json", ".jsonc", ".json5", ".md", ".mdx", ".txt", ".xml", ".yml", ".yaml", ".html", ".css", ".scss", ".less", ".astro", ".vue", ".svelte"]
			.some(ext => path.extname(src).toLowerCase() === ext)) {
			const content = fs.readFileSync(src, "utf-8");
			let replacedContent = content;
			for (const [key, value] of Object.entries(allReplacements))
				replacedContent = replacedContent.replace(new RegExp(`{{${key}}}`, "gi"), value);
			fs.writeFileSync(dest, replacedContent);
		} else fs.copyFileSync(src, dest);
	};

	const copyAllFiles = (dirPath: string) => {
		const files = fs.readdirSync(dirPath);

		for (const file of files) {
			const filePath = path.join(dirPath, file);
			const relativePath = path.relative(templatePath, filePath);
			const destPath = path.join(outputPath, relativePath);
			if (fs.statSync(filePath).isDirectory()) copyAllFiles(filePath);
			else copyFile(filePath, destPath);
		}
	};

	if (!fs.existsSync(templatePath)) throw new Error(`Template path does not exist: ${templatePath}`);
	if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

	if (fs.statSync(templatePath).isDirectory()) copyAllFiles(templatePath);
	else copyFile(templatePath, outputPath);
}

export function createDirStructure(target: string) {
	if (!fs.existsSync(target)) fs.mkdirSync(target);
	const dirs = ["src", "src/components", "src/layouts", "src/styles", "src/content", "src/pages"];

	for (const dir of dirs) {
		const dirPath = path.join(target, dir);
		if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
	}
}
