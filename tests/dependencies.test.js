import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

const root = new URL('../', import.meta.url)

describe('the dependencies', () => {
  // A package that extends this one installs these dependencies next to its own. When one of them does not accept the
  // version of another, npm puts it in a nested folder and Prettier or ESLint cannot find it from the project.
  it('accept each other: no invalid peer dependency', () => {
    let output = ''

    try {
      execFileSync('npm', ['ls', '--all'], { cwd: root, encoding: 'utf8', stdio: 'pipe' })
    } catch (error) {
      output = `${error.stdout}${error.stderr}`
        .split('\n')
        .filter((line) => /\b(invalid|missing):/.test(line))
        .join('\n')
    }

    expect(output).toBe('')
  })
})
