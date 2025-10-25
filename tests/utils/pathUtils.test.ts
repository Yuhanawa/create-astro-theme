import fs from "fs-extra";
import { describe, expect, test, vi } from "vitest";
import { getBackupPath } from "../../src/utils/pathUtils";

describe("getBackupPath", () => {
	const pathExistsSpy = vi.spyOn(fs, "pathExists");

	const a = "./a.txt";
	const abak = "./a.txt.bak";
	const abak2 = "./a.txt.bak2";

	test("should return the original path if it does not exist", async () => {
		pathExistsSpy.mockImplementationOnce(() => Promise.resolve(false));
		const path = await getBackupPath(a);
		expect(pathExistsSpy).toHaveBeenCalledWith(a);
		expect(path).toBe(a);
	});

	test("should return a path with .bak if the original path exists", async () => {
		pathExistsSpy
			.mockImplementationOnce(() => Promise.resolve(true))
			.mockImplementationOnce(() => Promise.resolve(false));
		const path = await getBackupPath(a);
		expect(pathExistsSpy).toHaveBeenCalledWith(a);
		expect(path).toBe(abak);
	});

	test("should return a path with .bak2 if .bak also exists", async () => {
		pathExistsSpy
			.mockImplementationOnce(() => Promise.resolve(true))
			.mockImplementationOnce(() => Promise.resolve(true))
			.mockImplementationOnce(() => Promise.resolve(false));
		const path = await getBackupPath(a);
		expect(pathExistsSpy).toHaveBeenCalledWith(a);
		expect(pathExistsSpy).toHaveBeenCalledWith(abak);
		expect(pathExistsSpy).toHaveBeenCalledWith(abak2);
		expect(path).toBe(abak2);
	});
});
