import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'

const base = fileURLToPath(
  new URL('../config/tsconfig.base.json', import.meta.url),
)
const tsc = fileURLToPath(import.meta.resolve('typescript/lib/tsc.js'))
const folders = []

// Compiles the files with the base config, in a folder of their own, and returns the codes of the errors.
const errorsOf = (files) => {
  const folder = mkdtempSync(path.join(tmpdir(), 'tsconfig-'))

  folders.push(folder)
  writeFileSync(
    path.join(folder, 'tsconfig.json'),
    JSON.stringify({
      extends: base,
      include: ['*.ts'],
      compilerOptions: { noEmit: true },
    }),
  )

  for (const [name, content] of Object.entries(files)) {
    writeFileSync(path.join(folder, name), content)
  }

  const { stdout } = spawnSync(process.execPath, [tsc, '-p', folder], {
    encoding: 'utf8',
  })

  return [...stdout.matchAll(/error (TS\d+)/g)].map((match) => match[1])
}

afterAll(() => {
  for (const folder of folders) {
    rmSync(folder, { recursive: true, force: true })
  }
})

describe('the TypeScript base, as TypeScript applies it', () => {
  it('accepts a clean file', () => {
    expect(errorsOf({ 'a.ts': 'export const a: number = 1\n' })).toEqual([])
  })

  it('knows the DOM and not Node.js: it is made for the web', () => {
    expect(errorsOf({ 'a.ts': 'export const body = document.body\n' })).toEqual(
      [],
    )
    expect(
      errorsOf({ 'a.ts': 'export const home = process.env.HOME\n' }),
    ).toEqual(['TS2591'])
  })

  it('does not trust an index: the value may be undefined', () => {
    expect(
      errorsOf({
        'a.ts':
          "const list: string[] = ['a']\nexport const first: string = list[0]\n",
      }),
    ).toEqual(['TS2322'])
  })

  it('wants a type to be imported as a type', () => {
    expect(
      errorsOf({
        'a.ts': 'export interface A {\n  a: string\n}\n',
        'b.ts': "import { A } from './a'\n\nexport const b: A = { a: 'x' }\n",
      }),
    ).toEqual(['TS1484'])
  })

  it('does not accept undefined for an optional property', () => {
    expect(
      errorsOf({
        'a.ts': 'export const a: { b?: number } = { b: undefined }\n',
      }),
    ).toEqual(['TS2375'])
  })

  it('reports the unused locals and parameters', () => {
    expect(
      errorsOf({
        'a.ts':
          'export function f(a: number) {\n  const b = 1\n\n  return 2\n}\n',
      }).sort(),
    ).toEqual(['TS6133', 'TS6133'])
  })
})
