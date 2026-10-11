import { ESLint } from 'eslint'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import eslintConfig from '../config/eslint.config.js'
import prettierConfig from '../config/prettier.config.js'
import stylelintConfig from '../config/stylelint.config.js'
import vitestConfig from '../config/vitest.config.js'

describe('the shipped configurations', () => {
  it('loads each configuration', () => {
    expect(Array.isArray(eslintConfig)).toBe(true)
    expect(prettierConfig.semi).toBe(false)
    expect(stylelintConfig.extends).toContain('stylelint-config-standard-scss')
    expect(vitestConfig.test.coverage.provider).toBe('v8')
  })

  it('has a valid tsconfig and markdownlint file', () => {
    const tsconfig = JSON.parse(readFileSync(new URL('../config/tsconfig.base.json', import.meta.url), 'utf8'))
    const markdownlint = JSON.parse(readFileSync(new URL('../config/.markdownlint.json', import.meta.url), 'utf8'))

    expect(tsconfig.compilerOptions.strict).toBe(true)
    expect(markdownlint.default).toBe(true)
  })

  it('reports a violation of the rules with ESLint', async () => {
    const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: eslintConfig })
    const [result] = await eslint.lintText('var a = 1\nif (a == 1) { }\n', { filePath: 'sample.js' })
    const rules = result.messages.map((message) => message.ruleId)

    expect(rules).toContain('no-var')
    expect(rules).toContain('eqeqeq')
  })
})
