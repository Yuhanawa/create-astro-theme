import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { beforeEach, describe, expect, test } from "vitest";
import { copyDirAndBackupFiles } from "../../src/utils/fsUtils";

describe("copyDirAndBackupFiles", () => {
	const tempdir = path.join(os.tmpdir(), "create-astro-theme-test", "fsUtils", Date.now().toString());
	const sourceDir = path.join(tempdir, "source");
	const targetDir = path.join(tempdir, "target");
	const sourceFile = path.join(sourceDir, "a.txt");
	const targetFile = path.join(targetDir, "a.txt");

	beforeEach(() => {
		fs.emptyDirSync(tempdir);
	});

	test("copy directory", async () => {
		fs.outputFileSync(path.join(sourceDir, "a.txt"), "a");
		fs.outputFileSync(path.join(sourceDir, "b", "c.txt"), "c");
		await copyDirAndBackupFiles(sourceDir, targetDir, false);
		expect(fs.readFileSync(path.join(targetDir, "a.txt"), "utf-8")).toBe("a");
		expect(fs.readFileSync(path.join(targetDir, "b", "c.txt"), "utf-8")).toBe("c");
	});

	test("copy directory with backup", async () => {
		fs.outputFileSync(path.join(sourceDir, "a.txt"), "new");
		fs.outputFileSync(path.join(targetDir, "a.txt"), "old");
		await copyDirAndBackupFiles(sourceDir, targetDir, false);
		expect(fs.readFileSync(path.join(targetDir, "a.txt"), "utf-8")).toBe("new");
		expect(fs.readFileSync(path.join(targetDir, "a.txt.bak"), "utf-8")).toBe("old");
	});
});
