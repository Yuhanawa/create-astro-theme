# Astro Theme Provider Template

This repository contains a template for creating an Astro theme integration with [`Astro Theme Provider`](https://github.com/astrolicious/astro-theme-provider).

## How to Author a Theme

1. Clone the [theme template](https://github.com/astrolicious/astro-theme-provider-template):

```sh
git clone https://github.com/astrolicious/astro-theme-provider-template.git {{THEMENAME}}
```

2. Navigate to the created directory and install dependencies:

> **Important**: This repo uses ***pnpm*** workspaces, you must use ***pnpm*** as your package manager

```sh
cd {{THEMENAME}}/
pnpm install
```

3. Run the playground to generate types for theme development and preview any changes:

> **Important**: The playground always has to be running to generate types when authoring a theme

```sh
pnpm playground:dev
```

4. **Update `package.json`**: Add `homepage` and `repository` properties to your theme package (`package/package.json`), you should see warnings in the console that explains this further. While you are there, add or modify any other properties you may want like `description`, `keywords`, `license`, `author`, etc. (see: [configuring `package.json`](https://docs.npmjs.com/cli/v6/configuring-npm/package-json)).
5. **Explore!** Authoring a theme using `astro-theme-provider` is similar to creating a normal Astro project. Explore the repo and [check out the docs](https://astro-theme-provider.netlify.app/) to learn more about how to author a theme.