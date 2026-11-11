import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const pkg = JSON.parse(read('package.json'))
const stubs = readdirSync(new URL('../stubs/', import.meta.url))
const ignoreFiles = ['.markdownlintignore', '.prettierignore', '.stylelintignore']
const entryPoints = Object.keys(pkg.exports).map((key) => `${pkg.name}${key.slice(1)}`)

describe('the thin files for the editor', () => {
  it('are published with the package', () => {
    expect(pkg.files).toContain('stubs/')
  })

  it('hold one file for each tool of the base', () => {
    expect(stubs.sort()).toEqual([
      '.markdownlint.json',
      '.markdownlintignore',
      '.prettierignore',
      '.stylelintignore',
      'eslint.config.mjs',
      'prettier.config.mjs',
      'stylelint.config.mjs',
      'tsconfig.json',
      'vitest.config.mjs',
    ])
  })

  it.each(ignoreFiles)('%s is a copy of the file of the base, in the stubs and at the root', (file) => {
    expect(read(`stubs/${file}`), 'stubs').toBe(read(`config/${file}`))
    expect(read(file), 'root').toBe(read(`config/${file}`))
  })

  it.each(stubs.filter((stub) => !ignoreFiles.includes(stub)))('%s only extends the base', (stub) => {
    const content = read(`stubs/${stub}`)

    if (stub.endsWith('.json')) {
      const { extends: extended, ...rest } = JSON.parse(content)

      expect(rest, 'no rule of its own').toEqual({})
      expect(extended).toMatch(new RegExp(`${pkg.name}/`))

      return
    }

    const [, from] = content.match(/^export \{ default \} from '(.+)'\n$/)

    expect(entryPoints).toContain(from)
  })
})
