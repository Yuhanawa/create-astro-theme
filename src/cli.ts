#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { cancel, confirm, group, intro, multiselect, outro, select, text } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import packageJson from "../package.json";

const program = new Command();

program
  .name("create-astro-theme")
  .version(packageJson.version)
  .description("A CLI tool to bootstrap your project")
  .action(async () => {
    console.log(chalk.green("Welcome to Create Astro Theme!"));

    intro("Create Theme With Astro Theme Provider");

    // find out package.json in the current directory
    const inProject = fs.existsSync(path.join(process.cwd(), "package.json"));

    const actionType = await select({
      message: "What do you want to do?",
      options: [
        {
          value: "project",
          label: "new project and theme",
          hint: `with Astro Theme Provider ${!inProject ? "(recommended)" : ""}`,
        },
        {
          value: "theme",
          label: "new theme",
          hint: `in this project${inProject ? "(recommended)" : "(or directory)"}`,
        },
        { value: 'install', label: 'I just want to create a website with my favorite theme' },
      ],
      initialValue: inProject ? "theme" : "project",
    });

    if (!inProject && actionType === "theme") {
      const shouldContinue = await confirm({
        message:
          "It looks like you're not in a project, you might want to create a `new project and theme with Astro Theme Provider`, Are you sure continue to create a theme in this directory?",
      });
      if (!shouldContinue) cancel();
    }

    if (actionType === "project") {
      /* 
      theme name

      npm
      Use Typescript
      Install Modules
      */
    }

    if (actionType === "project" || actionType === "theme") {
      /* 
      theme name
      Install Modules
      */
    }

    outro("No Future Be Implementation, I Will Finish It In The Future, But Now, I Want Eat And Sleep");
  });

program.parse(process.argv);
