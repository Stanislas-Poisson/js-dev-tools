import { format, resolveConfig } from 'prettier'
import { describe, expect, it } from 'vitest'

const configFile = new URL('../config/prettier.config.js', import.meta.url).pathname

// The options that Prettier applies to a file: the base ones and the override of its type.
const optionsOf = async (filepath) => ({ ...(await resolveConfig(filepath, { config: configFile })), filepath })

describe('the Prettier decisions', () => {
  it('applies the same options to every type of file, but JSON', async () => {
    for (const file of ['a.js', 'a.ts', 'a.vue', 'a.scss', 'a.css', 'a.yml', 'a.html', 'a.blade.php']) {
      const options = await optionsOf(file)

      expect(options, file).toMatchObject({
        printWidth: 120,
        tabWidth: 2,
        useTabs: false,
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: true,
        jsxSingleQuote: false,
        vueIndentScriptAndStyle: false,
        singleAttributePerLine: false,
      })
    }
  })

  it('keeps only two overrides: the PHP version of Blade and no trailing comma in JSON', async () => {
    expect(await optionsOf('a.blade.php')).toMatchObject({ phpVersion: '8.3', trailingCommaPHP: true })

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
    expect(await format('$m: (a: 1, b: 2);\n', { ...(await optionsOf('a.scss')), printWidth: 10 })).toContain(
      'b: 2,\n)',
    )
  })

  it('formats JSON without a trailing comma, JSONC too', async () => {
    const source = '{"a":[1,2,3],"b":{"cccccccccccccccc":1,"dddddddddddddddd":2}}\n'

    for (const file of ['a.json', 'a.jsonc']) {
      expect(await format(source, { ...(await optionsOf(file)), printWidth: 20 }), file).not.toMatch(/,\s*[}\]]/)
    }
  })
})
