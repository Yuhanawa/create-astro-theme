import path from "node:path";
import type { UseCommandConfig } from "../config";
import type { actions } from "../core/action";
import { type UseTemplateData, versions } from "../templateData";

const plan = (config: UseCommandConfig): actions => {
	return [
		{ type: "CREATE_DIR", path: config.projectName },
		{
			type: "COPY_TEMPLATE_DIR",
			dir: "use",
			target: config.projectName,
			data: {
				versions: versions,
				projectName: config.projectName,
				themeName: config.themeName,
				themeVersion: config.themeVersion,
			} satisfies UseTemplateData,
		},
		{ type: "RUN_COMMAND", command: `pnpm install ${config.themeName}`, cwd: config.projectName },
		{
			type: "COPY_DIR",
			dir: path.join(config.projectName, "node_modules", config.themeName, "theme-example"),
			target: config.projectName,
			overwrite: true,
		},
	];
};

export default { plan };
