import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

// The blocks of a file (separated by an empty line), without the comments and the empty lines.
const blocks = (text) =>
  text
    .split('\n\n')
    .map((block) =>
      block.split('\n').filter((line) => line && !line.startsWith('#')),
    )
    .filter((lines) => lines.length > 0)

const sorted = (lines) =>
  [...lines].sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))

describe('the order of the ignore files', () => {
  it.each(['.prettierignore', '.stylelintignore', '.markdownlintignore'])(
    '%s lists the folders, then the files, each in alphabetical order',
    (file) => {
      const [folders, files] = blocks(read(`config/${file}`))

      for (const folder of folders) {
        expect(folder, folder).toMatch(/\/$/)
      }

      for (const entry of files) {
        expect(entry, entry).not.toMatch(/\/$/)
      }

      expect(folders).toEqual(sorted(folders))
      expect(files).toEqual(sorted(files))
    },
  )

  it('.gitattributes lists the folders, then the files, that stay out of the archive', () => {
    const lines = read('.gitattributes')
      .split('\n\n')
      .map((block) =>
        block.split('\n').filter((line) => line.endsWith(' export-ignore')),
      )
      .filter((block) => block.length > 0)
      .map((block) => block.map((line) => line.replace(' export-ignore', '')))
    const [folders, files] = lines

    expect(lines).toHaveLength(2)
    expect(folders).toEqual(sorted(folders))
    expect(files).toEqual(sorted(files))
    expect(folders).toEqual(['/.github', '/assets', '/tests'])
  })
})
