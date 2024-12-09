import { z } from "zod";

function getDefaultValue(schema: z.AnyZodObject): Record<string, unknown> {
	return Object.fromEntries(
		// biome-ignore format:
		Object.entries(schema.shape).map(([key, value]) => [
            key,
            value instanceof z.ZodObject ? getDefaultValue(value) :
            value instanceof z.ZodOptional ? null :
            value instanceof z.ZodDefault ? null :
            value instanceof z.ZodString ? `<${key}>` :
            value instanceof z.ZodNumber ? 0 :
            value instanceof z.ZodBoolean ? false :
            value instanceof z.ZodArray ? [] :
            value instanceof z.ZodEnum ? value.options[0] :
            value instanceof z.ZodDate ? new Date() :
            value instanceof z.ZodUndefined ? "{{undefined}}" :
            value instanceof z.ZodNullable ? "{{null}}" :
            null,
        ]).filter(([, value]) => value !== null),
	);
}

export function getDefaultValueString(schema: z.AnyZodObject) {
	return JSON.stringify(getDefaultValue(schema), null, 2).replace(/"{{(.+)}}"/g, "$1");
}
