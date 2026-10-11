# js-dev-tools

[![CI][ci-badge]][ci]
[![Release][release-badge]][releases]
[![npm][npm-badge]][npm]
[![License][license-badge]][license]

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

export default { ...base, printWidth: 100 }
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

## For the zairakai projects

[`@zairakai/js-dev-tools`](https://www.npmjs.com/package/@zairakai/js-dev-tools) requires this package and adds the Makefile targets, the Git hooks, the GitLab CI templates and the automatic update of the dependencies.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security reports: [SECURITY.md](SECURITY.md).

## License

MIT, see [LICENSE](LICENSE).

[ci]: https://github.com/Stanislas-Poisson/js-dev-tools/actions/workflows/ci.yml
[ci-badge]: https://github.com/Stanislas-Poisson/js-dev-tools/actions/workflows/ci.yml/badge.svg
[releases]: https://github.com/Stanislas-Poisson/js-dev-tools/releases
[release-badge]: https://img.shields.io/github/v/release/Stanislas-Poisson/js-dev-tools
[npm]: https://www.npmjs.com/package/@stanislas-poisson/js-dev-tools
[npm-badge]: https://img.shields.io/npm/v/@stanislas-poisson/js-dev-tools
[license]: LICENSE
[license-badge]: https://img.shields.io/github/license/Stanislas-Poisson/js-dev-tools
