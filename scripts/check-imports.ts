import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const SRC_DIR = resolve("src");
const FORBIDDEN_IMPORTS = ["node:fs", "node:child_process"];
let hasIssue = false;

function checkFile(filePath: string): void {
	const content = readFileSync(filePath, "utf-8");
	const lines = content.split("\n");

	lines.forEach((line, index) => {
		if (filePath.includes("fs-wrapper.ts") || filePath.includes("exec.ts")) return;

		if (line.includes("import") && FORBIDDEN_IMPORTS.some((imp) => line.includes(imp))) {
			console.error(`❌ Found direct import in ${filePath}:${index + 1}`);
			console.error(`   ${line.trim()}`);
			console.error("   Please use ./utils/fs-wrapper or ./utils/exec instead\n");
			hasIssue = true;
		}
	});
}

function walkDir(dir: string): void {
	const files = readdirSync(dir, { withFileTypes: true });

	for (const file of files) {
		const path = join(dir, file.name);

		if (file.isDirectory()) {
			walkDir(path);
		} else if (file.name.endsWith(".ts") || file.name.endsWith(".js")) {
			checkFile(path);
		}
	}
}

console.log("🔍 Checking for direct imports...\n");
walkDir(SRC_DIR);
console.log("✅ Check complete!");

if (hasIssue) {
	console.error("❌ Found direct imports, please use ./utils/fs-wrapper or ./utils/exec instead");
	console.error("❕ This procedure is to ensure that the dry run works properly");
	process.exit(1);
}
