import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const root = new URL('../', import.meta.url)

describe('the dependencies', () => {
  // A package that extends this one installs these dependencies next to its own. When one of them does not accept the
  // version of another, npm puts it in a nested folder and Prettier or ESLint cannot find it from the project.
  it('accept each other: no invalid peer dependency', () => {
    let output = ''

    try {
      execFileSync('npm', ['ls', '--all'], {
        cwd: root,
        encoding: 'utf8',
        stdio: 'pipe',
      })
    } catch (error) {
      output = `${error.stdout}${error.stderr}`
        .split('\n')
        .filter((line) => /\b(invalid|missing):/.test(line))
        .join('\n')
    }

    expect(output).toBe('')
  })

  // The package ships the configuration of these tools without installing them: a project that uses one installs it, and
  // npm does not install an optional peer dependency on its own.
  it('declares the tools it configures but does not install as optional peers', () => {
    const { peerDependencies, peerDependenciesMeta } = JSON.parse(
      readFileSync(new URL('package.json', root), 'utf8'),
    )

    expect(Object.keys(peerDependencies).sort()).toEqual([
      '@vitest/coverage-v8',
      'markdownlint-cli2',
      'typescript',
      'vitest',
    ])

    for (const name of Object.keys(peerDependencies)) {
      expect(peerDependenciesMeta[name], name).toEqual({ optional: true })
    }
  })
})
