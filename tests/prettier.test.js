import path from 'node:path'
import { format, resolveConfig } from 'prettier'
import { describe, expect, it } from 'vitest'
import config from '../config/prettier.config.js'

const configFile = new URL('../config/prettier.config.js', import.meta.url)
  .pathname

// The options that Prettier applies to a file: the base ones and the override of its type.
const optionsOf = async (filepath) => ({
  ...(await resolveConfig(filepath, { config: configFile })),
  filepath,
})

describe('the Prettier decisions', () => {
  it('sets no width: Prettier keeps its default of 80, the column limit of the Google JavaScript Style Guide', async () => {
    expect((await optionsOf('a.js')).printWidth).toBeUndefined()
  })

  it('writes only what differs from the defaults of Prettier: no semicolons and single quotes', async () => {
    expect(Object.keys(config).sort()).toEqual([
      'overrides',
      'plugins',
      'semi',
      'singleQuote',
    ])

    for (const file of [
      'a.js',
      'a.ts',
      'a.vue',
      'a.scss',
      'a.css',
      'a.yml',
      'a.html',
      'a.blade.php',
    ]) {
      expect(await optionsOf(file), file).toMatchObject({
        semi: false,
        singleQuote: true,
      })
    }
  })

  it('keeps only two overrides: the PHP version of Blade and no trailing comma in JSON', async () => {
    expect(await optionsOf('a.blade.php')).toMatchObject({
      phpVersion: '8.4',
      trailingCommaPHP: true,
    })

    for (const file of ['a.json', 'a.jsonc', 'package.json']) {
      expect((await optionsOf(file)).trailingComma, file).toBe('none')
    }
  })

  it('formats JavaScript without semicolons, with single quotes and a trailing comma on the parameters', async () => {
    const source =
      'const a = {b: "x", c: [1,2]};\nfunction f(aaaaaaaaaaaaaaaaaaaaaaaa, bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb, cccccccccccccccccccccccccc, dddddddddddddddddddddddd, eeeeeeeeeeeeee) {}\n'
    const output = await format(source, await optionsOf('a.js'))

    expect(output).toContain("const a = { b: 'x', c: [1, 2] }")
    expect(output).toContain('eeeeeeeeeeeeee,\n) {}')
  })

  it('formats YAML with single quotes', async () => {
    expect(await format('a: "x"\n', await optionsOf('a.yml'))).toBe("a: 'x'\n")
  })

  it('formats a SCSS map with a trailing comma', async () => {
    expect(
      await format('$m: (a: 1, b: 2);\n', {
        ...(await optionsOf('a.scss')),
        printWidth: 10,
      }),
    ).toContain('b: 2,\n)')
  })

  it('formats JSON without a trailing comma, JSONC too', async () => {
    const source =
      '{"a":[1,2,3],"b":{"cccccccccccccccc":1,"dddddddddddddddd":2}}\n'

    for (const file of ['a.json', 'a.jsonc']) {
      expect(
        await format(source, { ...(await optionsOf(file)), printWidth: 20 }),
        file,
      ).not.toMatch(/,\s*[}\]]/)
    }
  })

  it('gives absolute paths to the plugins, so that a project finds them wherever npm put them', async () => {
    const { plugins } = await resolveConfig('a.js', { config: configFile })

    expect(plugins).toHaveLength(3)
    for (const plugin of plugins) {
      expect(path.isAbsolute(plugin)).toBe(true)
    }
  })

  it('formats a PHP file with the plugin it resolved', async () => {
    const output = await format('<?php\n$a=1;', await optionsOf('a.php'))

    expect(output).toContain('$a = 1;')
  })
})
