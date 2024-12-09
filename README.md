# create-astro-theme

## CLI

This is a CLI tool for creating Astro theme with [Astro Theme Provider](https://github.com/astrolicious/astro-theme-provider)

```bash
npm create astro-theme@latest
# or
pnpm create astro-theme@latest
# or
yarn create astro-theme@latest
```

https://github.com/user-attachments/assets/a8632bd1-41d4-4fe0-8100-0d20fcf1900e

### LIB

A library for theme author to provide a CLI tool to theme users

it's like this

#### for author


A library for theme author to provide a CLI tool to theme users

```ts
initConfig(
	packageName,
	configSchema,
	defaultConfigs: {
		minimal: {
            //..
            // auto or manual
        };
		recommended: {
            //..
            // manual
        };
		// [key: string]: configType;
	},
	// options?: {
	// 	dryRun?: boolean;
	// 	cwd?: string;
	// }
)
```

#### for user (Untested, may contain bugs)

- from zero to create website with their favorite theme

```bash
npm create astro-theme@latest with-theme theme-name
```

```bash
pnpm theme-name init
```

## TODO

- [ ] support js
- [ ] support npm and yarn (only pnpm is supported now)
- [x] create package in `package/` and playground in `playground/`
- [ ] add options
  - [x] --dry-run
  - [ ] -y --yes
  - [ ] --template
  - [ ] --theme
  - [ ] --structure
  - [x] --install --no-install
  - [x] --git --no-git
- [ ] cli example
