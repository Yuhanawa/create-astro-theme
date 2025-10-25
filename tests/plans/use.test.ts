import path from "node:path";
import { describe, expect, test } from "vitest";
import type { UseCommandConfig } from "../../src/config";
import usePlan from "../../src/plans/use";
import { versions } from "../../src/templateData";

describe("use plan", () => {
	test("should return a plan to use a theme", () => {
		const themeName = "my-theme";
		const projectName = "my-project";
		const config: UseCommandConfig = {
			themeName: themeName,
			projectName: projectName,
			themeVersion: "1.0.0",
			dryRun: false,
			verbose: false,
			skip: false,
		};

		const plan = usePlan.plan(config);

		expect(plan).toEqual([
			{ type: "CREATE_DIR", path: projectName },
			{
				type: "COPY_TEMPLATE_DIR",
				dir: "use",
				target: projectName,
				data: {
					versions: versions,
					projectName: projectName,
					themeName: themeName,
					themeVersion: "1.0.0",
				},
			},
			{ type: "RUN_COMMAND", command: `pnpm install ${themeName}`, cwd: projectName },
			{
				type: "COPY_DIR",
				dir: path.join(projectName, "node_modules", themeName, "theme-example"),
				target: projectName,
				overwrite: true,
			},
		]);
	});
});
