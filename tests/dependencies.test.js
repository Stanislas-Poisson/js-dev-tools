import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const root = new URL('../', import.meta.url)

const installed = (name) => JSON.parse(readFileSync(new URL(`node_modules/${name}/package.json`, root), 'utf8')).version

// The rows of the table "Dependencies held back" of CONTRIBUTING.md: [name, held at].
const heldBack = () => {
  const section = readFileSync(new URL('CONTRIBUTING.md', root), 'utf8').split('## Dependencies held back')[1]
  const rows = section.split('\n').filter((line) => /^\| `/.test(line))

  return rows.map((row) => {
    const [name, version] = row
      .split('|')
      .map((cell) => cell.trim().replaceAll('`', ''))
      .slice(1, 3)

    return [name, version]
  })
}

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

  // CONTRIBUTING.md lists what is held back and why. Updating one of them anyway breaks what extends this package.
  it('keeps the dependencies held back at their version', () => {
    const rows = heldBack()

    expect(rows.length).toBeGreaterThan(0)

    for (const [name, version] of rows) {
      if (/^\d+\.\d+\.\d+$/.test(version) || /^\d+\.\d+\.x$/.test(version)) {
        const prefix = version.replace(/\.x$/, '')

        expect(installed(name), `${name} is held back at ${version}`).toMatch(
          new RegExp(`^${prefix.replaceAll('.', '\\.')}(\\.|$)`)
        )
      }
    }
  })
})
