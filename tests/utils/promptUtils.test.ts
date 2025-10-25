import * as p from "@clack/prompts";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { pwc } from "../../src/utils/promptUtils";

vi.mock("@clack/prompts", () => ({
	isCancel: vi.fn(),
	cancel: vi.fn(),
}));

describe("promptWithCancel", () => {
	const pIsCancel = vi.spyOn(p, "isCancel");
	const pCancel = vi.spyOn(p, "cancel");

	beforeEach(() => {
		pIsCancel.mockClear();
		pCancel.mockClear();
	});

	test("should return the value of the prompt", async () => {
		const prompt = vi.fn().mockResolvedValue("test");
		const value = await pwc(prompt);

		expect(prompt).toHaveBeenCalled();

		expect(pIsCancel).toHaveBeenCalled();
		expect(pCancel).not.toHaveBeenCalled();

		expect(value).toBe("test");
	});

	test("should the cancel", async () => {
		const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
		const prompt = vi.fn();
		vi.mocked(pIsCancel).mockResolvedValueOnce(true);
		await pwc(prompt);

		expect(prompt).toHaveBeenCalled();

		expect(pIsCancel).toHaveBeenCalled();
		expect(pCancel).toHaveBeenCalled();

		expect(exitSpy).toHaveBeenCalledWith(0);
	});

	test("should call custom cancel function", async () => {
		const exitSpy = vi.spyOn(process, "exit").mockImplementationOnce(() => undefined as never);
		const prompt = vi.fn().mockResolvedValue("test");
		const cancel = vi.fn().mockImplementationOnce((value) => {});
		const value = await pwc(prompt, cancel);

		expect(prompt).toHaveBeenCalled();

		expect(pIsCancel).not.toHaveBeenCalled();
		expect(pCancel).not.toHaveBeenCalled();
		expect(exitSpy).not.toHaveBeenCalled();

		expect(cancel).toHaveBeenCalled();
		expect(value).toBe("test");
	});
});
