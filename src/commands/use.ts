import { type UseCommandConfig, useCommandDefaultConfig } from "../config";
import { run as action } from "../core/action";
import plans from "../plans";
import prompts from "../prompts";
import type { OptionalProperty } from "../utils/typeUtils";

const run = async (optionalConfig: OptionalProperty<UseCommandConfig>) => {
	const config = {
		...useCommandDefaultConfig,
		...(await prompts.use.prompt(optionalConfig)),
	};

	const plan = plans.use.plan(config);

	try {
		await action(plan, { dryRun: !!config.dryRun, verbose: !!config.verbose });
	} catch (e) {
		console.error(e);
	}

	prompts.use.endPrompt(config);
};

export default { run };
