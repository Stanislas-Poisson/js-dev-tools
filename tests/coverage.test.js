import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'

const base = fileURLToPath(
  new URL('../config/vitest.config.js', import.meta.url),
)
const vitest = path.join(
  path.dirname(fileURLToPath(import.meta.resolve('vitest/package.json'))),
  'vitest.mjs',
)
const folders = []

// Runs the tests of a small project with the base config; `unused` is a file of src that no test imports.
const run = (unused) => {
  const folder = mkdtempSync(path.join(tmpdir(), 'coverage-'))

  folders.push(folder)
  mkdirSync(path.join(folder, 'src'))
  mkdirSync(path.join(folder, 'tests'))
  writeFileSync(
    path.join(folder, 'vitest.config.mjs'),
    `import base from ${JSON.stringify(base)}\n\nexport default {\n  ...base,\n  test: { ...base.test, globals: true },\n}\n`,
  )
  writeFileSync(
    path.join(folder, 'src', 'used.js'),
    'export const used = () => 1\n',
  )
  writeFileSync(
    path.join(folder, 'tests', 'used.test.js'),
    "import { used } from '../src/used.js'\n\nit('works', () => {\n  expect(used()).toBe(1)\n})\n",
  )

  if (unused) {
    writeFileSync(
      path.join(folder, 'src', 'unused.js'),
      Array.from(
        { length: 20 },
        (_, index) => `export const f${index} = () => ${index}\n`,
      ).join(''),
    )
  }

  const result = spawnSync(
    process.execPath,
    [vitest, 'run', '--coverage', '--root', folder],
    { cwd: folder, encoding: 'utf8' },
  )

  return { status: result.status, output: `${result.stdout}${result.stderr}` }
}

afterAll(() => {
  for (const folder of folders) {
    rmSync(folder, { recursive: true, force: true })
  }
})

describe('the coverage of the base', () => {
  it('passes when every file of src is tested', () => {
    const { status, output } = run(false)

    expect(output).toContain('Coverage report')
    expect(status).toBe(0)
  })

  it('counts a file that no test imports, and fails under the threshold', () => {
    const { status, output } = run(true)

    expect(output).toContain('unused.js')
    expect(output).toMatch(/threshold/i)
    expect(status).not.toBe(0)
  })
}, 120_000)
