import stylelint from 'stylelint'
import { describe, expect, it } from 'vitest'
import stylelintConfig from '../config/stylelint.config.js'

const orderWarnings = async (code) => {
  const { results } = await stylelint.lint({ code, codeFilename: 'a.scss', config: stylelintConfig })

  return results[0].warnings.filter((warning) => warning.rule.startsWith('order/'))
}

describe('the Stylelint decisions', () => {
  it('orders the properties by group', async () => {
    expect(
      await orderWarnings(
        '.a {\n  position: absolute;\n  display: flex;\n  width: 1px;\n  color: red;\n  cursor: pointer;\n}\n',
      ),
    ).toEqual([])
    expect(
      (await orderWarnings('.a {\n  color: red;\n  position: absolute;\n}\n')).map((warning) => warning.rule),
    ).toEqual(['order/properties-order'])
  })

  it('puts the properties that are not in the list last', async () => {
    const warnings = await orderWarnings('.a {\n  zzz-unknown: 1;\n  cursor: pointer;\n}\n')

    expect(warnings[0].text).toContain('cursor')
    expect(await orderWarnings('.a {\n  cursor: pointer;\n  aaa-unknown: 1;\n  zzz-unknown: 1;\n}\n')).toEqual([])
  })

  it('orders the elements of a block: @include, declarations, nested rules, then the other at-rules', async () => {
    const good =
      '.a {\n  @include reset;\n\n  color: red;\n\n  &:hover {\n    color: blue;\n  }\n\n  @media (width >= 1px) {\n    color: green;\n  }\n}\n'
    const bad = '.a {\n  &:hover {\n    color: blue;\n  }\n\n  @include reset;\n\n  color: red;\n}\n'

    expect(await orderWarnings(good)).toEqual([])
    expect((await orderWarnings(bad)).map((warning) => warning.rule)).toContain('order/order')
  })

  it('has one ignore list, in .stylelintignore', () => {
    expect(stylelintConfig.ignoreFiles).toBeUndefined()
    expect(stylelintConfig.plugins).toContain('stylelint-order')
  })
})
