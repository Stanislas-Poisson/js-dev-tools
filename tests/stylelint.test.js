import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import stylelint from 'stylelint'
import { describe, expect, it } from 'vitest'
import stylelintConfig, {
  createStylelintConfig,
  propertiesOrder,
} from '../config/stylelint.config.js'

const configPath = fileURLToPath(
  new URL('../config/stylelint.config.js', import.meta.url),
)
const stylelintBin = path.join(
  path.dirname(fileURLToPath(import.meta.resolve('stylelint'))),
  '..',
  'bin',
  'stylelint.mjs',
)

const orderWarnings = async (code, config = stylelintConfig) => {
  const { results } = await stylelint.lint({
    code,
    codeFilename: 'a.scss',
    config,
  })

  return results[0].warnings.filter((warning) =>
    warning.rule.startsWith('order/'),
  )
}

describe('the Stylelint decisions', () => {
  it('orders the properties by group', async () => {
    expect(
      await orderWarnings(
        '.a {\n  position: absolute;\n  display: flex;\n  width: 1px;\n  color: red;\n  cursor: pointer;\n}\n',
      ),
    ).toEqual([])
    expect(
      (
        await orderWarnings('.a {\n  color: red;\n  position: absolute;\n}\n')
      ).map((warning) => warning.rule),
    ).toEqual(['order/properties-order'])
  })

  it('puts the properties that are not in the list last', async () => {
    const warnings = await orderWarnings(
      '.a {\n  zzz-unknown: 1;\n  cursor: pointer;\n}\n',
    )

    expect(warnings[0].text).toContain('cursor')
    expect(
      await orderWarnings(
        '.a {\n  cursor: pointer;\n  aaa-unknown: 1;\n  zzz-unknown: 1;\n}\n',
      ),
    ).toEqual([])
  })

  it('orders only the safe elements of a block: $variables, then @extend, then @include', async () => {
    const good =
      '.a {\n  $x: 1px;\n  @extend %b;\n  @include reset;\n\n  color: red;\n}\n'
    const bad = '.a {\n  @include reset;\n  $x: 1px;\n\n  color: red;\n}\n'

    expect(await orderWarnings(good)).toEqual([])
    expect((await orderWarnings(bad)).map((warning) => warning.rule)).toContain(
      'order/order',
    )
  })

  it('leaves control directives and custom properties where the author put them, as moving them changes the CSS', async () => {
    const code =
      '.a {\n  @if $dark {\n    $x: 1px;\n  }\n\n  --a: #{$x};\n  color: red;\n  @include reset;\n\n  &:hover {\n    color: blue;\n  }\n}\n'

    expect(await orderWarnings(code)).toEqual([])
  })

  it('knows the logical properties next to their physical equivalents', async () => {
    expect(
      await orderWarnings(
        '.a {\n  display: block;\n  inline-size: 1px;\n  padding: 1px;\n  color: red;\n}\n',
      ),
    ).toEqual([])
  })

  it('orders the sides clockwise, then the block axis before the inline axis, the start before the end', () => {
    const at = (property) => propertiesOrder.indexOf(property)

    for (const family of ['margin', 'padding']) {
      const order = [
        family,
        `${family}-top`,
        `${family}-right`,
        `${family}-bottom`,
        `${family}-left`,
        `${family}-block`,
        `${family}-block-start`,
        `${family}-block-end`,
        `${family}-inline`,
        `${family}-inline-start`,
        `${family}-inline-end`,
      ]

      expect(order.map(at), family).toEqual(
        [...order.map(at)].sort((a, b) => a - b),
      )
      expect(order.map(at), family).not.toContain(-1)
    }

    expect(at('inset-inline')).toBeGreaterThan(at('inset-block-end'))
    expect(at('border-block')).toBeLessThan(at('border-inline'))
    expect(at('border-top-color')).toBeLessThan(at('border-right'))
    expect(at('inline-size')).toBeLessThan(at('block-size'))
  })

  it('places a vendor-prefixed property like its unprefixed one', async () => {
    expect(
      await orderWarnings(
        '.a {\n  font-size: 1px;\n  -webkit-font-smoothing: antialiased;\n  color: blue;\n  -webkit-text-fill-color: red;\n  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-user-select: none;\n  user-select: none;\n}\n',
      ),
    ).toEqual([])
  })

  it('knows the properties that the projects use, so that none of them goes last by chance', async () => {
    for (const property of [
      'accent-color',
      'clip-path',
      'color-scheme',
      'fill',
      'font-display',
      'src',
      'touch-action',
      'unicode-range',
    ]) {
      expect(propertiesOrder, property).toContain(property)
    }
  })

  it('lets a project add, remove or move a property and an element of a block', async () => {
    const config = createStylelintConfig({
      properties: (list) => {
        list.splice(list.indexOf('color') + 1, 0, 'my-property')

        return list.filter((property) => property !== 'float')
      },
      blocks: (list) => list.reverse(),
      rules: { 'color-named': 'never' },
    })

    expect(config.rules['color-named']).toBe('never')
    expect(config.rules['order/properties-order'][0]).toContain('my-property')
    expect(config.rules['order/properties-order'][0]).not.toContain('float')
    expect(propertiesOrder).toContain('float')
    expect(
      await orderWarnings(
        '.a {\n  color: blue;\n  my-property: 1;\n}\n',
        config,
      ),
    ).toEqual([])
    expect(
      (
        await orderWarnings(
          '.a {\n  my-property: 1;\n  color: blue;\n}\n',
          config,
        )
      ).map((warning) => warning.rule),
    ).toEqual(['order/properties-order'])
    expect(stylelintConfig.rules['order/properties-order'][0]).not.toContain(
      'my-property',
    )
  })

  it('has one ignore list, in .stylelintignore', () => {
    expect(stylelintConfig.ignoreFiles).toBeUndefined()
    expect(
      stylelintConfig.plugins.some((plugin) =>
        plugin.includes('stylelint-order'),
      ),
    ).toBe(true)
  })
})

describe('the resolution of the dependencies', () => {
  it('gives absolute paths to extends and plugins, so that a project finds them wherever npm put them', () => {
    for (const entry of [
      ...stylelintConfig.extends,
      ...stylelintConfig.plugins,
    ]) {
      expect(path.isAbsolute(entry)).toBe(true)
    }
  })

  it('lints from a project that spreads the config and has none of its dependencies in its node_modules', () => {
    const project = mkdtempSync(path.join(tmpdir(), 'stylelint-project-'))
    const configFile = path.join(project, 'stylelint.config.mjs')
    const target = path.join(project, 'a.scss')

    writeFileSync(
      configFile,
      `import base from ${JSON.stringify(pathToFileURL(configPath).href)}\n\nexport default { ...base }\n`,
    )
    writeFileSync(target, '.a {\n  color: red;\n  position: absolute;\n}\n')

    try {
      // Stylelint falls back to the working directory to find a package: run it from the project, in its own process
      const result = spawnSync(
        process.execPath,
        [stylelintBin, '--config', configFile, '--formatter', 'json', target],
        {
          cwd: project,
          encoding: 'utf8',
        },
      )
      const output = JSON.parse(result.stderr || result.stdout)

      expect(result.stderr).not.toContain('Could not find')
      expect(output[0].warnings.map((warning) => warning.rule)).toContain(
        'order/properties-order',
      )
    } finally {
      rmSync(project, { recursive: true, force: true })
    }
  })
})
