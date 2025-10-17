import type { CreateCommandConfig } from "../config";
import type { actions } from "../core/action";
import { type CreateTemplateData, versions } from "../templateData";

const plan = (config: CreateCommandConfig): actions => {
	return [
		{ type: "CREATE_DIR", path: config.projectName },
		{
			type: "COPY_TEMPLATE_DIR",
			dir: "create",
			target: config.projectName,
			data: {
				versions: versions,
				projectName: config.projectName,
				themeName: config.themeName,
			} satisfies CreateTemplateData,
		},
	];
};
export default { plan };
