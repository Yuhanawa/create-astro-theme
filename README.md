# create-astro-theme

[![npm version](https://img.shields.io/npm/v/create-astro-theme.svg)](https://www.npmjs.com/package/create-astro-theme)

A CLI tool for creating and using themes with `astro-theme-provider`.

## Prerequisites

Currently, this tool only supports `pnpm`. Support for `npm` is planned for the future.

## Usage

You can use `create-astro-theme` with `pnpm`:

```bash
# With pnpm
pnpm create astro-theme@latest
```

This will start an interactive prompt that will guide you through the process.

### Commands

`create-astro-theme` has two main commands:  `use` and `create`.

#### `use`

The `use` command helps you use an existing Astro theme in a new project.

```bash
pnpm create astro-theme@latest use <theme-name>
```

This will create a new project that uses the specified theme.

**Options:**

| Option          | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `--dry-run`     | Show what would be done without actually making changes.   |
| `--verbose`     | Show more detailed output.                                 |
| `--skip`        | Use recommended or default settings and skip prompts.      |
| `--project-name`| Specify the project name.                                  |

#### `create`

The `create` command helps you create a new Astro theme.

```bash
pnpm create astro-theme@latest create <theme-name>
```

This will create a new directory with the specified theme name, containing a new Astro theme project.

**Options:**

| Option          | Description                                                |
| --------------- | ---------------------------------------------------------- |
| `--dry-run`     | Show what would be done without actually making changes.   |
| `--verbose`     | Show more detailed output.                                 |
| `--skip`        | Use recommended or default settings and skip prompts.      |
| `--project-name`| Specify the project name (defaults to `<theme-name>`).     |
| `--theme-name`  | Specify the theme name (defaults to `<theme-name>`).       |


## Contributing

Contributions are welcome! Please open an issue or submit a pull request on our [GitHub repository](https://github.com/Yuhanawa/create-astro-theme).

## License

This project is licensed under the [MIT License](LICENSE).

