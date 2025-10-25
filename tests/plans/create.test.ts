import { describe, expect, test } from "vitest";
import type { CreateCommandConfig } from "../../src/config";
import createPlan from "../../src/plans/create";
import { versions } from "../../src/templateData";

describe("create plan", () => {
	test("should return a plan to create a new theme", () => {
		const themeName = "my-theme";
		const projectName = "my-project";
		const config: CreateCommandConfig = {
			themeName: themeName,
			projectName: projectName,
			dryRun: false,
			verbose: false,
			skip: false,
		};

		const plan = createPlan.plan(config);

		expect(plan).toEqual([
			{ type: "CREATE_DIR", path: projectName },
			{
				type: "COPY_TEMPLATE_DIR",
				dir: "create",
				target: projectName,
				data: {
					versions: versions,
					projectName: projectName,
					themeName: themeName,
				},
			},
		]);
	});
});
