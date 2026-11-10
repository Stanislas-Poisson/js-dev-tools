# JS Dev Tools

![JS Dev Tools](https://raw.githubusercontent.com/Stanislas-Poisson/js-dev-tools/main/assets/banner.png)

[![CI][ci-badge]][ci]
[![Tests][tests-badge]][ci]
[![Release][release-badge]][releases]
[![npm][npm-badge]][npm]
[![License][license-badge]][license]

[![Node.js][node-badge]][node]
[![ESLint][eslint-badge]][eslint]
[![Prettier][prettier-badge]][prettier]
[![Stylelint][stylelint-badge]][stylelint]
[![Vitest][vitest-badge]][vitest]
[![TypeScript][typescript-badge]][typescript]

The quality tools of the JavaScript and TypeScript projects: ESLint, Prettier, Stylelint, Vitest, TypeScript and markdownlint configurations, as a base that a project extends.

## The principle

A project does not copy the rules of the tools. It has its own small configuration files, which **extend** the rules that live in `node_modules/`. The rules are then always the ones of the installed version of this package, and the project only writes what is specific to it.

| Tool | Entry point |
| :--- | :--- |
| ESLint | `@stanislas-poisson/js-dev-tools/eslint` |
| Prettier | `@stanislas-poisson/js-dev-tools/prettier` |
| Stylelint | `@stanislas-poisson/js-dev-tools/stylelint` |
| Vitest | `@stanislas-poisson/js-dev-tools/vitest` |
| TypeScript | `@stanislas-poisson/js-dev-tools/tsconfig` |
| markdownlint | `@stanislas-poisson/js-dev-tools/markdownlint` |

## Install

```bash
npm install --save-dev @stanislas-poisson/js-dev-tools
```

Requires Node.js 24 or later.

## Use

```js
// eslint.config.js
import base from '@stanislas-poisson/js-dev-tools/eslint'

export default [...base, { rules: { 'no-console': 'warn' } }]
```

```js
// prettier.config.js
import base from '@stanislas-poisson/js-dev-tools/prettier'

// Only what is specific to the project is written here.
export default { ...base }
```

```js
// stylelint.config.js
import base from '@stanislas-poisson/js-dev-tools/stylelint'

export default { ...base }
```

```js
// vitest.config.js
import { mergeConfig } from 'vitest/config'
import base from '@stanislas-poisson/js-dev-tools/vitest'

export default mergeConfig(base, { test: { environment: 'jsdom' } })
```

```json
{
  "extends": "@stanislas-poisson/js-dev-tools/tsconfig"
}
```

```json
{
  "extends": "./node_modules/@stanislas-poisson/js-dev-tools/config/.markdownlint.json"
}
```

## What the base sets

| Tool | Main settings |
| :--- | :--- |
| Prettier | 120 columns, 2 spaces, no semicolons, single quotes, trailing commas everywhere (none in JSON), `.vue` script and style not indented |
| ESLint | Recommended rules, Vue and TypeScript rules, no yoda conditions; the format is left to Prettier |
| Stylelint | Standard SCSS, Vue and HTML rules; properties in a fixed order (positioning, layout, box model, typography, visual, animations, miscellaneous), the others last in alphabetical order |
| Vitest | No globals (import `describe`, `it` and `expect` from `vitest`), reports in `coverage/`, 75 % minimum of coverage and 90 % as the good level |
| TypeScript | Strict, target ES2022, default libraries (DOM included) |
| markdownlint | Default rules, without a line length limit |

## Documentation

Every option of every tool, with its value and the reason for it, is in the [handbook][handbook-configs]. The conventions of the commits, the branches and the releases are in the [handbook][handbook-policies] too.

## For the zairakai projects

[`@zairakai/js-dev-tools`](https://www.npmjs.com/package/@zairakai/js-dev-tools) requires this package and adds the Makefile targets, the Git hooks, the GitLab CI templates and the automatic update of the dependencies.

## Contributing

| Command | Description |
| :--- | :--- |
| `npm run quality` | Runs every check, in order: ESLint, Prettier, markdownlint, tests. |
| `npm run quality:fix` | Applies every fix that a tool can make: ESLint, Prettier, markdownlint. |

See [CONTRIBUTING.md](CONTRIBUTING.md). Security reports: [SECURITY.md](SECURITY.md).

## Statistics

![Statistics of js-dev-tools][stats-card]

## License

[MIT](LICENSE). Copyright (c) 2024 Stanislas Poisson.

[ci]: https://github.com/Stanislas-Poisson/js-dev-tools/actions/workflows/ci.yml
[ci-badge]: https://github.com/Stanislas-Poisson/js-dev-tools/actions/workflows/ci.yml/badge.svg
[tests-badge]: https://img.shields.io/github/check-runs/Stanislas-Poisson/js-dev-tools/main?nameFilter=Tests%20(Node.js%2024)&label=tests
[releases]: https://github.com/Stanislas-Poisson/js-dev-tools/releases
[release-badge]: https://img.shields.io/github/v/release/Stanislas-Poisson/js-dev-tools
[npm]: https://www.npmjs.com/package/@stanislas-poisson/js-dev-tools
[npm-badge]: https://img.shields.io/npm/v/@stanislas-poisson/js-dev-tools
[license]: LICENSE
[license-badge]: https://img.shields.io/github/license/Stanislas-Poisson/js-dev-tools
[node-badge]: https://img.shields.io/badge/node.js-%3E%3D24-green.svg?logo=node.js
[node]: https://nodejs.org
[eslint-badge]: https://img.shields.io/badge/code%20style-eslint-4B32C3.svg?logo=eslint
[eslint]: https://eslint.org
[prettier-badge]: https://img.shields.io/badge/formatter-prettier-F7B93E.svg?logo=prettier
[prettier]: https://prettier.io
[stylelint-badge]: https://img.shields.io/badge/css-stylelint-263238.svg?logo=stylelint
[stylelint]: https://stylelint.io
[vitest-badge]: https://img.shields.io/badge/test-vitest-6E9F18.svg?logo=vitest
[vitest]: https://vitest.dev
[typescript-badge]: https://img.shields.io/badge/types-typescript-3178C6.svg?logo=typescript
[typescript]: https://www.typescriptlang.org
[stats-card]: https://raw.githubusercontent.com/Stanislas-Poisson/Stanislas-Poisson/main/assets/projects/stanislas-js-dev-tools.svg
[handbook-configs]: https://gitlab.com/zairakai/handbook/-/blob/main/packages/js-dev-tools/configs.md
[handbook-policies]: https://gitlab.com/zairakai/handbook/-/blob/main/policies/git-rules.md
