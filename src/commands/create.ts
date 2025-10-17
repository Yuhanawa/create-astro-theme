import { type CreateCommandConfig, createCommandDefaultConfig } from "../config";
import { run as action } from "../core/action";
import plans from "../plans";
import prompts from "../prompts";
import type { OptionalProperty } from "../utils/typeUtils";

const run = async (optionalConfig: OptionalProperty<CreateCommandConfig>) => {
	const config = {
		...createCommandDefaultConfig,
		...(await prompts.create.prompt(optionalConfig)),
	};

	const plan = plans.create.plan(config);

	try {
		await action(plan, { dryRun: !!config.dryRun, verbose: !!config.verbose });
	} catch (e) {
		console.error(e);
	}

	prompts.create.endPrompt(config);
};

export default { run };
