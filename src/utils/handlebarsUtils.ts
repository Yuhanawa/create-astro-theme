import { camelCase, constantCase, kebabCase, pascalCase, snakeCase } from "change-case";
import Handlebars from "handlebars";

export const registerCaseHelper = () => {
	Handlebars.registerHelper("pascalCase", (str) => pascalCase(str));
	Handlebars.registerHelper("camelCase", (str) => camelCase(str));
	Handlebars.registerHelper("snakeCase", (str) => snakeCase(str));
	Handlebars.registerHelper("kebabCase", (str) => kebabCase(str));
	Handlebars.registerHelper("constantCase", (str) => constantCase(str));
};
