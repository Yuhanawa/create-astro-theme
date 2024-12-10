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

## TODO:

- init config
**already implemented, but not tested**

init.config.json

```json
{
  "config": {
    "object": {
      // ...
    }
  }
}
```

when user run `npm create astro-theme@latest init theme-name`

the content of object in `init.config.json` will be copied to `astro.config.ts`

- from zero to create website with their favorite theme

> has problem: `astro-theme-provider` seems that astro v5 is not supported
> 
> solution:
> 
> - create a template using astro v4
> 
> - let `astro-theme-provider` support v5
> 

```bash
npm create astro-theme@latest with-theme theme-name
```

## others

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
