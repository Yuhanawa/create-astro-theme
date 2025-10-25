import { cancel as CANCEL_SYMBOL } from "@clack/prompts";
import { vol } from "memfs";
import { beforeEach, vi } from "vitest";
import { registerCaseHelper } from "../src/utils/handlebarsUtils";

registerCaseHelper();

//! I don't know why this doesn't work and how to make it work
//! so, please use `os.tempdir()`
/* 
vi.mock("fs", () => ({ ...fs, default: fs, exports: fs }));
vi.mock("fs/promises", () => ({ ...fs.promises, default: fs.promises, exports: fs.promises }));
vi.mock("graceful-fs", () => ({ ...fs, default: fs, exports: fs }));
vi.mock("fs-extra", async () => {
	const fse = await import("fs-extra");
	const mockFsExtra = {
		...fse,
		...fs,
		...fs.promises,
		promises: fs.promises,
	};
	return {
		...mockFsExtra,
		default: mockFsExtra,
		exports: mockFsExtra,
		esm: {
			...mockFsExtra,
			default: mockFsExtra,
			exports: mockFsExtra,
		}
	}
});
vi.mock("fs-extra/esm", async () => {
	const fse = await import("fs-extra");
	const mockFsExtra = {
		...fse,
		...fs,
		...fs.promises,
		promises: fs.promises,
	};
	return {
		...mockFsExtra,
		default: mockFsExtra,
		exports: mockFsExtra,
		esm: {
			...mockFsExtra,
			default: mockFsExtra,
			exports: mockFsExtra,
		}
	}
});
*/

vi.mock("@clack/prompts", () => ({
	...vi.importActual("@clack/prompts"),
	intro: vi.fn(),
	outro: vi.fn(),

	text: vi.fn(async (options) => Promise.resolve(CANCEL_SYMBOL)),
	select: vi.fn(async (options) => Promise.resolve(CANCEL_SYMBOL)),
	confirm: vi.fn(async (options) => Promise.resolve(CANCEL_SYMBOL)),
	multiselect: vi.fn(async (options) => Promise.resolve(CANCEL_SYMBOL)),
	groupMultiselect: vi.fn(async (options) => Promise.resolve(CANCEL_SYMBOL)),

	log: {
		info: vi.fn(),
		success: vi.fn(),
		step: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		message: vi.fn(),
	},

	spinner: vi.fn(() => ({
		start: vi.fn(),
		stop: vi.fn(),
	})),

	progress: vi.fn(() => ({
		start: vi.fn(),
		stop: vi.fn(),
		advance: vi.fn(),
	})),

	// stream: vi.fn(() => ({
	//     // TODO mock stream for @clack/prompts
	// })),

	// taskLog: vi.fn(() => ({
	//     // TODO mock stream for @clack/prompts
	// }))
}));

vi.mock("node:child_process", () => ({
	exec: vi.fn((command, options, callback) => {
		if (callback) {
			callback(null, "", "");
		}
		return null;
	}),
}));

vi.spyOn(console, "log").mockImplementation(() => undefined);

beforeEach(() => {
	vi.resetAllMocks();
	vol.reset();
});
