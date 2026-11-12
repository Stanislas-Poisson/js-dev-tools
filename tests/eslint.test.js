import { ESLint } from 'eslint'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import eslintConfig from '../config/eslint.config.js'

const eslint = new ESLint({
  overrideConfigFile: true,
  overrideConfig: eslintConfig,
})

const rulesOf = async (code, filePath) => {
  const [result] = await eslint.lintText(code, { filePath })

  return result.messages.map((message) => message.ruleId)
}

describe('the ESLint decisions', () => {
  it('forbids yoda conditions', async () => {
    expect(
      await rulesOf('const a = 1\nif (1 === a) {\n  a.toString()\n}\n', 'a.js'),
    ).toContain('yoda')
    expect(
      await rulesOf('const a = 1\nif (a === 1) {\n  a.toString()\n}\n', 'a.js'),
    ).not.toContain('yoda')
  })

  it('forbids yoda conditions in the templates of Vue files', async () => {
    // A Vue file is linted with types: the file of the test is allowed by default in a temporary folder
    const dir = mkdtempSync(path.join(tmpdir(), 'eslint-vue-'))
    writeFileSync(path.join(dir, 'tsconfig.json'), '{}')
    const vueEslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        ...eslintConfig,
        {
          files: ['**/*.vue'],
          languageOptions: {
            parserOptions: {
              projectService: { allowDefaultProject: ['*.vue'] },
              tsconfigRootDir: dir,
            },
          },
        },
      ],
      cwd: dir,
    })
    const rules = async (condition) => {
      const [result] = await vueEslint.lintText(
        `<template>\n  <p v-if="${condition}">x</p>\n</template>\n<script setup lang="ts">\nconst a: number = 1\n</script>\n`,
        { filePath: path.join(dir, 'a.vue') },
      )

      return result.messages.map((message) => message.ruleId)
    }

    try {
      for (const condition of [
        '1 === a',
        "'x' !== a",
        '0 < a',
        'undefined === a',
      ]) {
        expect(await rules(condition)).toContain('vue/no-restricted-syntax')
      }

      for (const condition of ['a === 1', 'a !== undefined', 'a > 0']) {
        expect(await rules(condition)).not.toContain('vue/no-restricted-syntax')
      }
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('is made for the web: the Node.js globals are known only where Node.js runs (scripts, tools, bin, tests, config)', async () => {
    const code = 'export const a = process.env.HOME\n'

    expect(await rulesOf(code, 'src/a.js')).toContain('no-undef')

    for (const file of [
      'scripts/a.mjs',
      'tools/a.js',
      'bin/a.js',
      'a.config.js',
    ]) {
      expect(await rulesOf(code, file), file).not.toContain('no-undef')
    }
  })

  it('has no global for the tests: they import the functions of Vitest', async () => {
    expect(await rulesOf("describe('x', () => {})\n", 'a.test.js')).toContain(
      'no-undef',
    )
    expect(
      await rulesOf(
        "import { describe } from 'vitest'\ndescribe('x', () => {})\n",
        'a.test.js',
      ),
    ).not.toContain('no-undef')
  })

  it('relaxes the console in the tests and the configuration files, and no-require-imports in the latter', async () => {
    expect(
      (await eslint.calculateConfigForFile('a.test.js')).rules['no-console'][0],
    ).toBe(0)
    expect(
      (await eslint.calculateConfigForFile('vite.config.js')).rules[
        'no-console'
      ][0],
    ).toBe(0)
    expect(
      (await eslint.calculateConfigForFile('vite.config.js')).rules[
        '@typescript-eslint/no-require-imports'
      ][0],
    ).toBe(0)
  })

  it('declares the TypeScript rules once, for the TypeScript and the Vue files', async () => {
    const rules = [
      '@typescript-eslint/no-unused-vars',
      '@typescript-eslint/prefer-optional-chain',
    ]
    const blocks = eslintConfig.filter((block) =>
      rules.some((rule) => block.rules?.[rule]),
    )

    expect(blocks).toHaveLength(1)
    expect(blocks[0].files).toEqual(['**/*.ts', '**/*.tsx', '**/*.vue'])
  })

  it('ignores the generated and third-party folders, and the Prettier config comes last', async () => {
    for (const path of [
      'vendor/a.js',
      'dist/a.js',
      'build/a.js',
      'coverage/a.js',
      'docs/a.js',
      'public/a.js',
    ]) {
      expect(await eslint.isPathIgnored(path), path).toBe(true)
    }

    expect(eslintConfig.at(-1).rules.semi).toBe('off')
  })
})
