import { exec } from "node:child_process";
import os from "node:os";
import path from "node:path";
import * as p from "@clack/prompts";
import fs from "fs-extra";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { actions } from "../../src/core/action";
import { run } from "../../src/core/action";

describe("actions", () => {
	const tempdir = path.join(os.tmpdir(), "create-astro-theme-test", Date.now().toString());
	const sourceDir = path.join(tempdir, "source");
	const targetDir = path.join(tempdir, "target");
	const sourceFile = path.join(tempdir, "source.txt");
	const targetFile = path.join(tempdir, "target.txt");
	fs.ensureDirSync(tempdir);

	beforeEach(() => {
		fs.emptyDirSync(tempdir);
		fs.removeSync(sourceDir);
		fs.removeSync(targetDir);
		fs.removeSync(sourceFile);
		fs.removeSync(targetFile);
	});

	test("should create a directory", async () => {
		const dir = path.join(tempdir, "test-dir");
		const plan: actions = [{ type: "CREATE_DIR", path: dir }];
		await run(plan, { dryRun: false, verbose: false });
		expect(fs.existsSync(dir)).toBe(true);
	});

	test("should write a file", async () => {
		const file = path.join(tempdir, "test.txt");
		const content = "hello";
		const plan: actions = [{ type: "WRITE_FILE", path: file, content: content }];
		await run(plan, { dryRun: false, verbose: false });
		expect(fs.readFileSync(file, "utf-8")).toBe(content);
	});

	describe("COPY_FILE with overwrite", () => {
		test("overwrite: true", async () => {
			fs.writeFileSync(sourceFile, "new");
			fs.writeFileSync(targetFile, "old");
			const plan: actions = [{ type: "COPY_FILE", file: sourceFile, target: targetFile, overwrite: true }];
			await run(plan, { dryRun: false, verbose: false });
			expect(fs.readFileSync(targetFile, "utf-8")).toBe("new");
		});

		test("overwrite: false", async () => {
			fs.writeFileSync(sourceFile, "new");
			fs.writeFileSync(targetFile, "old");
			const plan: actions = [{ type: "COPY_FILE", file: sourceFile, target: targetFile, overwrite: false }];
			await run(plan, { dryRun: false, verbose: false });
			expect(fs.readFileSync(targetFile, "utf-8")).toBe("old");
		});

		test("overwrite: 'backup'", async () => {
			fs.writeFileSync(sourceFile, "new");
			fs.writeFileSync(targetFile, "old");
			const plan: actions = [{ type: "COPY_FILE", file: sourceFile, target: targetFile, overwrite: "backup" }];
			await run(plan, { dryRun: false, verbose: false });
			expect(fs.readFileSync(targetFile, "utf-8")).toBe("new");
			expect(fs.existsSync(`${targetFile}.bak`)).toBe(true);
			expect(fs.readFileSync(`${targetFile}.bak`, "utf-8")).toBe("old");
		});

		test("overwrite: 'ask' (yes)", async () => {
			fs.writeFileSync(sourceFile, "new");
			fs.writeFileSync(targetFile, "old");
			const plan: actions = [{ type: "COPY_FILE", file: sourceFile, target: targetFile, overwrite: "ask" }];
			vi.mocked(p.confirm).mockResolvedValue(true);
			await run(plan, { dryRun: false, verbose: false });
			expect(fs.readFileSync(targetFile, "utf-8")).toBe("new");
		});

		test("overwrite: 'ask' (no)", async () => {
			fs.writeFileSync(sourceFile, "new");
			fs.writeFileSync(targetFile, "old");
			const plan: actions = [{ type: "COPY_FILE", file: sourceFile, target: targetFile, overwrite: "ask" }];
			vi.mocked(p.confirm).mockResolvedValue(false);
			await run(plan, { dryRun: false, verbose: false });
			expect(fs.readFileSync(targetFile, "utf-8")).toBe("old");
		});
	});

	describe("COPY_DIR with overwrite", () => {
		test("overwrite: true", async () => {
			fs.outputFileSync(path.join(sourceDir, "a.txt"), "new");
			fs.outputFileSync(path.join(targetDir, "a.txt"), "old");
			fs.outputFileSync(path.join(targetDir, "b.txt"), "old_b");
			const plan: actions = [{ type: "COPY_DIR", dir: sourceDir, target: targetDir, overwrite: true }];
			await run(plan, { dryRun: false, verbose: false });
			expect(fs.readFileSync(path.join(targetDir, "a.txt"), "utf-8")).toBe("new");
			expect(fs.readFileSync(path.join(targetDir, "b.txt"), "utf-8")).toBe("old_b");
		});

		test("overwrite: false", async () => {
			fs.outputFileSync(path.join(sourceDir, "a.txt"), "new");
			fs.outputFileSync(path.join(targetDir, "a.txt"), "old");
			const plan: actions = [{ type: "COPY_DIR", dir: sourceDir, target: targetDir, overwrite: false }];
			await run(plan, { dryRun: false, verbose: false });
			expect(fs.readFileSync(path.join(targetDir, "a.txt"), "utf-8")).toBe("old");
		});

		test("overwrite: 'backup'", async () => {
			fs.outputFileSync(path.join(sourceDir, "a.txt"), "new");
			fs.outputFileSync(path.join(targetDir, "a.txt"), "old");
			const plan: actions = [{ type: "COPY_DIR", dir: sourceDir, target: targetDir, overwrite: "backup" }];
			await run(plan, { dryRun: false, verbose: false });
			expect(fs.readFileSync(path.join(targetDir, "a.txt"), "utf-8")).toBe("new");
			expect(fs.existsSync(path.join(targetDir, "a.txt.bak"))).toBe(true);
			expect(fs.readFileSync(path.join(targetDir, "a.txt.bak"), "utf-8")).toBe("old");
		});

		test("overwrite: 'ask' (yes)", async () => {
			fs.outputFileSync(path.join(sourceDir, "a.txt"), "new");
			fs.outputFileSync(path.join(targetDir, "a.txt"), "old");
			const plan: actions = [{ type: "COPY_DIR", dir: sourceDir, target: targetDir, overwrite: "ask" }];
			vi.mocked(p.confirm).mockResolvedValue(true);
			await run(plan, { dryRun: false, verbose: false });
			expect(fs.readFileSync(path.join(targetDir, "a.txt"), "utf-8")).toBe("new");
		});

		test("overwrite: 'ask' (no)", async () => {
			fs.outputFileSync(path.join(sourceDir, "a.txt"), "new");
			fs.outputFileSync(path.join(targetDir, "a.txt"), "old");
			const plan: actions = [{ type: "COPY_DIR", dir: sourceDir, target: targetDir, overwrite: "ask" }];
			vi.mocked(p.confirm).mockResolvedValue(false);
			await run(plan, { dryRun: false, verbose: false });
			expect(fs.readFileSync(path.join(targetDir, "a.txt"), "utf-8")).toBe("old");
		});
	});

	test("should copy a template directory", async () => {
		const plan: actions = [
			{
				type: "COPY_TEMPLATE_DIR",
				dir: "test",
				target: targetDir,
				data: { name: "world" },
			},
		];
		await run(plan, { dryRun: false, verbose: false });
		expect(fs.readFileSync(path.join(targetDir, "a.txt"), "utf-8")).toBe("hello world");
	});

	test("should copy a template file", async () => {
		const targetFile = path.join(targetDir, "test", "a.txt");
		const plan: actions = [
			{
				type: "COPY_TEMPLATE_FILE",
				file: "test/a.txt.hbs",
				target: targetDir,
				data: { name: "world" },
			},
		];
		await run(plan, { dryRun: false, verbose: false });
		expect(fs.readFileSync(targetFile, "utf-8")).toBe("hello world");
	});

	test("dry run should not copy template directory", async () => {
		const targetDir = path.join(tempdir, "target");
		const plan: actions = [
			{
				type: "COPY_TEMPLATE_DIR",
				dir: "test",
				target: targetDir,
				data: { name: "world" },
			},
		];
		await run(plan, { dryRun: true, verbose: false });
		expect(fs.existsSync(targetDir)).toBe(false);
	});

	test("dry run should not copy template file", async () => {
		const targetFile = path.join(targetDir, "test", "a.txt");
		const plan: actions = [
			{
				type: "COPY_TEMPLATE_FILE",
				file: "test/a.txt.hbs",
				target: targetDir,
				data: { name: "world" },
			},
		];
		await run(plan, { dryRun: true, verbose: false });
		expect(fs.existsSync(targetFile)).toBe(false);
	});
	test("should delete a file", async () => {
		const file = path.join(tempdir, "test.txt");
		fs.writeFileSync(file, "a");
		const plan: actions = [{ type: "DELETE_FILE", path: file }];
		await run(plan, { dryRun: false, verbose: false });
		expect(fs.existsSync(file)).toBe(false);
	});

	test("should delete a directory", async () => {
		const dir = path.join(tempdir, "test-dir");
		fs.ensureDirSync(dir);
		fs.writeFileSync(path.join(dir, "a.txt"), "a");
		const plan: actions = [{ type: "DELETE_DIR", path: dir }];
		await run(plan, { dryRun: false, verbose: false });
		expect(fs.existsSync(dir)).toBe(false);
	});

	test("should run a command", async () => {
		const plan: actions = [{ type: "RUN_COMMAND", command: "echo hello" }];
		await run(plan, { dryRun: false, verbose: false });
		expect(exec).toHaveBeenCalledWith("echo hello", { cwd: undefined }, expect.any(Function));
	});

	test("dry run should not execute actions", async () => {
		// AssertionError: expected "spy" to not be called at all, but actually been called 1 times
		const dir = path.join(tempdir, "test-dir-dry");
		const file = path.join(tempdir, "test-dry.txt");
		const plan: actions = [
			{ type: "CREATE_DIR", path: dir },
			{ type: "WRITE_FILE", path: file, content: "hello" },
			{ type: "RUN_COMMAND", command: "echo hello" },
		];
		await run(plan, { dryRun: true, verbose: false });
		expect(fs.existsSync(dir)).toBe(false);
		expect(fs.existsSync(file)).toBe(false);
		expect(exec).not.toHaveBeenCalled();
	});
});
