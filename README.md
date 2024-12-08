# create-astro-theme

This is a CLI tool for creating Astro theme with [Astro Theme Provider](https://github.com/astrolicious/astro-theme-provider)

```bash
npm create astro-theme@latest
# or
pnpm create astro-theme@latest
# or
yarn create astro-theme@latest
```


## TODO

### CLI

- [ ] support js
- [ ] create package in `package/` and playground in `playground/`
- [ ] add options
  - [ ] -y --yes
  - [ ] --template
  - [ ] --theme
  - [ ] --structure
  - [ ] --install --no-install
  - [ ] --git --no-git

### LIB

A library for theme author to provide a CLI tool to theme users

it's like this

#### for author

```ts
initConfig(ConfigSchema,
    {
        minimal:{
            //..
            // auto or manual
        }
        recommended:{
            //..
            // manual
        }
        much:{
            //..
            // auto, as possible as much
        }
    },
)

```

#### for user

- from zero to create website with their favorite theme
```bash
npm create astro-theme@latest --theme theme-name
```
it will create a astro project, install the theme, and run `pnpm theme-name init --template recommended`

- already have a project with theme, want to add minimal config in `astro.config.ts`
```bash
pnpm theme-name init --template minimal
```