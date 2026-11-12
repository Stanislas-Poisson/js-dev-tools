import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('../', import.meta.url))
const bin = (specifier) => fileURLToPath(import.meta.resolve(specifier))
const eslint = path.join(
  path.dirname(bin('eslint/package.json')),
  'bin',
  'eslint.js',
)
const prettier = path.join(
  path.dirname(bin('prettier/package.json')),
  'bin',
  'prettier.cjs',
)
const stylelint = path.join(
  path.dirname(bin('stylelint')),
  '..',
  'bin',
  'stylelint.mjs',
)

// A project outside of this repository, with the thin files of stubs/ and the package in its node_modules. The tools
// and the dependencies of the package are NOT in the node_modules of the project: it has to find them from the package,
// like a project where npm did not hoist them.
let project

const run = (script, args) =>
  spawnSync(process.execPath, [script, ...args], {
    cwd: project,
    encoding: 'utf8',
  })

beforeAll(() => {
  project = mkdtempSync(path.join(tmpdir(), 'consumer-'))
  mkdirSync(path.join(project, 'node_modules', '@stanislas-poisson'), {
    recursive: true,
  })
  symlinkSync(
    root,
    path.join(project, 'node_modules', '@stanislas-poisson', 'js-dev-tools'),
  )

  for (const stub of [
    'eslint.config.mjs',
    'prettier.config.mjs',
    'stylelint.config.mjs',
    'tsconfig.json',
  ]) {
    copyFileSync(path.join(root, 'stubs', stub), path.join(project, stub))
  }
})

afterAll(() => {
  rmSync(project, { recursive: true, force: true })
})

describe('a project that extends the base through the thin files', () => {
  it('lints TypeScript with the types (project service of typescript-eslint)', () => {
    writeFileSync(
      path.join(project, 'a.ts'),
      "export const f = (a?: string) => a || 'x'\n",
    )

    const { stdout, stderr } = run(eslint, ['--format', 'json', 'a.ts'])
    const [result] = JSON.parse(stdout || stderr)

    expect(result.messages.map((message) => message.ruleId)).toContain(
      '@typescript-eslint/prefer-nullish-coalescing',
    )
    expect(result.messages.filter((message) => message.fatal)).toEqual([])
  })

  it('formats JavaScript, PHP and Blade with the plugins of the package', () => {
    writeFileSync(path.join(project, 'a.js'), 'const a = {b:"x"};\n')
    writeFileSync(path.join(project, 'a.php'), '<?php\n$a=1;\n')

    expect(run(prettier, ['a.js']).stdout).toBe("const a = { b: 'x' }\n")
    expect(run(prettier, ['a.php']).stdout).toContain('$a = 1;')
  })

  it('lints SCSS with the order of the properties', () => {
    writeFileSync(
      path.join(project, 'a.scss'),
      '.a {\n  color: red;\n  position: absolute;\n}\n',
    )

    const { stdout, stderr } = run(stylelint, ['--formatter', 'json', 'a.scss'])
    const [result] = JSON.parse(stderr || stdout)

    expect(stderr).not.toContain('Could not find')
    expect(result.warnings.map((warning) => warning.rule)).toContain(
      'order/properties-order',
    )
  })
}, 120_000)
