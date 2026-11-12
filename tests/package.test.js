import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = new URL('../', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'))

describe('the published package', () => {
  const { files } = JSON.parse(
    execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }),
  )[0]
  const paths = files.map((file) => file.path)

  it('holds the configuration, the stubs, the README and the license', () => {
    expect(paths).toEqual(
      expect.arrayContaining([
        'package.json',
        'README.md',
        'LICENSE',
        'config/eslint.config.js',
        'config/prettier.config.js',
        'config/stylelint.config.js',
        'config/vitest.config.js',
        'config/tsconfig.base.json',
        'config/.markdownlint.json',
        'config/resolve.js',
        'stubs/eslint.config.mjs',
        'stubs/tsconfig.json',
      ]),
    )
  })

  it('holds nothing else: no test, no asset, no GitHub file', () => {
    for (const path of paths) {
      expect(path, path).toMatch(
        /^(package\.json|README\.md|LICENSE|config\/.+|stubs\/.+)$/,
      )
    }
  })

  it('has an entry point for every export, which exists in the package', () => {
    for (const [name, target] of Object.entries(manifest.exports)) {
      if (target.includes('*')) {
        continue
      }

      expect(paths, name).toContain(target.slice(2))
    }
  })

  it('resolves every export by the name of the package', () => {
    for (const [name, target] of Object.entries(manifest.exports)) {
      if (target.includes('*')) {
        continue
      }

      const resolved = import.meta.resolve(`${manifest.name}/${name.slice(2)}`)

      expect(fileURLToPath(resolved), name).toBe(
        fileURLToPath(new URL(target, root)),
      )
    }
  })
})
