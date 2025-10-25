import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { beforeEach, describe, expect, test } from "vitest";
import { copyTemplateDir, copyTemplateFile } from "../../src/utils/templateUtils";

describe("copyTemplateFile", () => {
	const tempdir = path.join(os.tmpdir(), "create-astro-theme-test", "templateUtils", Date.now().toString());
	const templateDir = path.join(tempdir, "templates");
	const targetDir = path.join(tempdir, "target");

	beforeEach(() => {
		fs.emptyDirSync(tempdir);
		fs.ensureDirSync(templateDir);
		fs.ensureDirSync(targetDir);
	});

	test("copy plain file", async () => {
		fs.outputFileSync(path.join(templateDir, "a.txt"), "a");
		await copyTemplateFile("a.txt", targetDir, {}, { templatePath: templateDir });
		expect(fs.readFileSync(path.join(targetDir, "a.txt"), "utf-8")).toBe("a");
	});

	test("copy file with underscore", async () => {
		fs.outputFileSync(path.join(templateDir, "_b.txt"), "b");
		await copyTemplateFile("_b.txt", targetDir, {}, { templatePath: templateDir });
		expect(fs.readFileSync(path.join(targetDir, "b.txt"), "utf-8")).toBe("b");
	});

	test("copy hbs file", async () => {
		fs.outputFileSync(path.join(templateDir, "c.txt.hbs"), "c {{name}}");
		await copyTemplateFile("c.txt.hbs", targetDir, { name: "test" }, { templatePath: templateDir });
		expect(fs.readFileSync(path.join(targetDir, "c.txt"), "utf-8")).toBe("c test");
	});

	test("copy hbs file with templated filename", async () => {
		fs.outputFileSync(path.join(templateDir, "{{kebabCase name}}.txt.hbs"), "d {{name}}");
		await copyTemplateFile(
			"{{kebabCase name}}.txt.hbs",
			targetDir,
			{ name: "TestName" },
			{ templatePath: templateDir },
		);
		expect(fs.readFileSync(path.join(targetDir, "test-name.txt"), "utf-8")).toBe("d TestName");
	});

	test("dry run", async () => {
		fs.outputFileSync(path.join(templateDir, "a.txt"), "a");
		await copyTemplateFile("a.txt", targetDir, {}, { templatePath: templateDir, dryRun: true });
		expect(fs.existsSync(path.join(targetDir, "a.txt"))).toBe(false);
	});
});

describe("copyTemplateDir", () => {
	const tempdir = path.join(os.tmpdir(), "create-astro-theme-test", "templateUtils", Date.now().toString());
	const templateDir = path.join(tempdir, "templates");
	const targetDir = path.join(tempdir, "target");

	beforeEach(() => {
		fs.emptyDirSync(tempdir);
		fs.ensureDirSync(templateDir);
		fs.ensureDirSync(targetDir);
	});

	test("copy directory", async () => {
		const templatePath = path.join(templateDir, "create");
		fs.outputFileSync(path.join(templatePath, "a.txt"), "a");
		fs.outputFileSync(path.join(templatePath, "_b.txt"), "b");
		fs.outputFileSync(path.join(templatePath, "c.txt.hbs"), "c {{name}}");
		fs.outputFileSync(path.join(templatePath, "{{kebabCase name}}.txt.hbs"), "d {{name}}");
		await copyTemplateDir("create", targetDir, { name: "TestName" }, { templatePath: templateDir });

		expect(fs.readFileSync(path.join(targetDir, "a.txt"), "utf-8")).toBe("a");
		expect(fs.readFileSync(path.join(targetDir, "b.txt"), "utf-8")).toBe("b");
		expect(fs.readFileSync(path.join(targetDir, "c.txt"), "utf-8")).toBe("c TestName");
		expect(fs.readFileSync(path.join(targetDir, "test-name.txt"), "utf-8")).toBe("d TestName");
	});

	test("dry run", async () => {
		const templatePath = path.join(templateDir, "create");
		fs.outputFileSync(path.join(templatePath, "a.txt"), "a");
		await copyTemplateDir("create", targetDir, { name: "TestName" }, { templatePath: templateDir, dryRun: true });
		expect(fs.readdirSync(targetDir).length).toBe(0);
	});
});
