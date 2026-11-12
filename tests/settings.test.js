import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import eslintConfig from '../config/eslint.config.js'
import vitestConfig from '../config/vitest.config.js'

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const lines = (path) => read(path).split('\n').filter(Boolean)

describe('the Vitest decisions', () => {
  it('has no globals, reports in the default folder and requires 75 % of coverage', () => {
    const { coverage, globals } = vitestConfig.test

    expect(globals).toBeUndefined()
    expect(coverage.reportsDirectory).toBeUndefined()
    expect(coverage.include).toEqual(['src/**'])
    expect(coverage.thresholds).toEqual({
      lines: 75,
      functions: 75,
      branches: 75,
      statements: 75,
    })
    expect(coverage.watermarks).toEqual({
      lines: [75, 90],
      functions: [75, 90],
      branches: [75, 90],
      statements: [75, 90],
    })
  })
})

describe('the TypeScript decisions', () => {
  it('lets TypeScript choose the libraries from the target, for the web (DOM included, no Node types)', () => {
    const { compilerOptions } = JSON.parse(read('config/tsconfig.base.json'))

    expect(compilerOptions.target).toBe('ES2025')
    expect(compilerOptions.lib).toBeUndefined()
    expect(compilerOptions.types).toBeUndefined()
  })

  it('is written for a bundler and for TypeScript 6: the recommended checks, and no option that is the default', () => {
    const { compilerOptions } = JSON.parse(read('config/tsconfig.base.json'))

    expect(compilerOptions).toMatchObject({
      module: 'ESNext',
      moduleResolution: 'bundler',
      moduleDetection: 'force',
      strict: true,
      exactOptionalPropertyTypes: true,
      noUncheckedIndexedAccess: true,
      noUncheckedSideEffectImports: true,
      isolatedModules: true,
      verbatimModuleSyntax: true,
    })
    expect(compilerOptions.esModuleInterop).toBeUndefined()
    expect(compilerOptions.forceConsistentCasingInFileNames).toBeUndefined()
  })
})

describe('the ignore lists', () => {
  const folders = [
    'node_modules',
    'vendor',
    'build',
    'coverage',
    'dist',
    'docs',
  ]

  it('ignore the same folders in every tool', () => {
    const eslint = eslintConfig.at(-2).ignores

    for (const folder of folders) {
      expect(eslint, `ESLint: ${folder}`).toContain(`${folder}/**`)

      for (const file of [
        '.prettierignore',
        '.stylelintignore',
        '.markdownlintignore',
      ]) {
        expect(lines(`config/${file}`), `${file}: ${folder}`).toContain(
          `${folder}/`,
        )
      }
    }
  })

  it('ignore the folders that a framework generates', () => {
    for (const file of ['.prettierignore', '.stylelintignore']) {
      expect(lines(`config/${file}`)).toEqual(
        expect.arrayContaining(['.nuxt/', '.output/', 'public/']),
      )
    }

    expect(lines('config/.markdownlintignore')).not.toContain('.opencode/')
  })
})

describe('the npm settings', () => {
  it('refuses a wrong version of Node, fails the audit from the high level, and repeats no default', () => {
    expect(lines('.npmrc')).toEqual(['engine-strict=true', 'audit-level=high'])
  })

  it('has no dependency that nothing uses', () => {
    const { dependencies } = JSON.parse(read('package.json'))

    expect(dependencies['stylelint-order']).toBeDefined()
    expect(dependencies['stylelint-config-standard']).toBeUndefined()
  })
})

describe('the editor and Markdown decisions', () => {
  it('has one base section, the 80 columns of JavaScript and one difference for Markdown in .editorconfig', () => {
    const editorconfig = read('.editorconfig')

    expect(editorconfig).toContain(
      '[*]\ncharset = utf-8\nend_of_line = lf\nindent_size = 2\nindent_style = space\n',
    )
    expect(editorconfig).toContain(
      '[*.md]\ntrim_trailing_whitespace = false\nindent_size = unset\n',
    )
    expect(editorconfig).toContain('[*.{js,mjs}]\nmax_line_length = 80\n')
    expect(editorconfig).not.toContain('max_line_length = 120')
  })

  it('has no line length limit in markdownlint', () => {
    const markdownlint = JSON.parse(read('config/.markdownlint.json'))

    expect(markdownlint.MD013).toBe(false)
  })

  it('has the markdownlint rules of the PHP base: the same Markdown rules in the JS and PHP projects', () => {
    const markdownlint = JSON.parse(read('config/.markdownlint.json'))

    expect(markdownlint.MD024).toEqual({ siblings_only: true })
    expect(markdownlint.MD033).toEqual({
      allowed_elements: ['details', 'summary', 'kbd', 'br', 'img', 'a', 'p'],
    })
    expect(markdownlint.MD060).toEqual({ style: 'compact' })
    expect(markdownlint.MD040).toBe(false)
    expect(markdownlint.MD041).toBe(false)
  })
})
