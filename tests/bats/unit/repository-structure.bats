#!/usr/bin/env bats
#
# Unit tests - repository structure
# The files and the contents that must stay, or be corrected with the test that names them.
# They run against the source tree, not against an installed package.
#

load '../helpers/test_helper'

setup() {
  setup_test_env
}

# Root
# ================

@test "the files of the repository are at the root" {
  for file in LICENSE README.md SECURITY.md CONTRIBUTING.md CODE_OF_CONDUCT.md \
    package.json package-lock.json .editorconfig .gitattributes .gitignore .npmrc; do
    assert_file_exists "${PROJECT_ROOT}/${file}"
  done
}

@test "the thin files for the editor are at the root" {
  for file in eslint.config.mjs prettier.config.mjs stylelint.config.mjs vitest.config.mjs \
    tsconfig.json .markdownlint.json; do
    assert_file_exists "${PROJECT_ROOT}/${file}"
  done
}

@test "the ignore files at the root are copies of the ones in config/" {
  for file in .markdownlintignore .prettierignore .stylelintignore; do
    assert_same_file "${PROJECT_ROOT}/${file}" "${PROJECT_ROOT}/config/${file}"
  done
}

@test "the assets hold the icon and the banner, in both formats" {
  for file in icon.png icon.svg banner.png banner.svg; do
    assert_file_exists "${PROJECT_ROOT}/assets/${file}"
  done
}

# config/ and stubs/
# ================

@test "config/ holds the configuration of each tool" {
  for file in eslint.config.js prettier.config.js stylelint.config.js vitest.config.js \
    tsconfig.base.json resolve.js .markdownlint.json; do
    assert_file_exists "${PROJECT_ROOT}/config/${file}"
  done
}

@test "config/ holds the ignore files" {
  for file in .markdownlintignore .prettierignore .stylelintignore; do
    assert_file_exists "${PROJECT_ROOT}/config/${file}"
  done
}

@test "stubs/ holds one thin file per tool and the ignore files" {
  for file in eslint.config.mjs prettier.config.mjs stylelint.config.mjs vitest.config.mjs \
    tsconfig.json .markdownlint.json .markdownlintignore .prettierignore .stylelintignore; do
    assert_file_exists "${PROJECT_ROOT}/stubs/${file}"
  done
}

@test "the ignore files of stubs/ are copies of the ones in config/" {
  for file in .markdownlintignore .prettierignore .stylelintignore; do
    assert_same_file "${PROJECT_ROOT}/stubs/${file}" "${PROJECT_ROOT}/config/${file}"
  done
}

# .github/
# ================

@test ".github holds the workflows" {
  for file in ci.yml policy.yml policy-sync.yml release.yml; do
    assert_file_exists "${PROJECT_ROOT}/.github/workflows/${file}"
  done
}

@test ".github holds the Dependabot configuration, the templates and the release notes categories" {
  for file in dependabot.yml pull_request_template.md release.yml \
    ISSUE_TEMPLATE/bug_report.yml ISSUE_TEMPLATE/config.yml; do
    assert_file_exists "${PROJECT_ROOT}/.github/${file}"
  done
}

@test "the CI runs the structure tests (BATS)" {
  assert_file_contains "${PROJECT_ROOT}/.github/workflows/ci.yml" "npm run bats"
}

@test "the pull request template asks for a subject of 50 characters at most" {
  assert_file_contains "${PROJECT_ROOT}/.github/pull_request_template.md" "50 characters at most"
}

# README
# ================

@test "the README shows the icon, not the banner" {
  assert_file_contains "${PROJECT_ROOT}/README.md" "assets/icon.png"
  assert_file_not_contains "${PROJECT_ROOT}/README.md" "banner"
}

@test "the README folds its long sections in details" {
  assert_file_contains "${PROJECT_ROOT}/README.md" "<details>"
  assert_file_contains "${PROJECT_ROOT}/README.md" "<summary>"
}

# Git
# ================

@test ".gitignore starts with the standard block of the handbook" {
  for text in "# JetBrains (PhpStorm, WebStorm)" "# Visual Studio Code and derivatives" \
    "# Other editors" "# AI assistants" "AGENTS.md" "CLAUDE.md" "GEMINI.md" "*.local.md"; do
    assert_file_contains "${PROJECT_ROOT}/.gitignore" "$text"
  done
}

@test ".gitattributes normalizes the line endings and keeps the Markdown diffs" {
  assert_file_contains "${PROJECT_ROOT}/.gitattributes" "* text=auto eol=lf"
  assert_file_contains "${PROJECT_ROOT}/.gitattributes" "*.md diff=markdown"
  assert_file_contains "${PROJECT_ROOT}/.gitattributes" "*.png binary"
}

@test ".gitattributes leaves the repository files out of the archive" {
  for entry in /.github /assets /tests /.editorconfig /.gitattributes /.gitignore /SECURITY.md; do
    assert_file_contains "${PROJECT_ROOT}/.gitattributes" "${entry} export-ignore"
  done
}

# Settings that must stay
# ================

@test ".editorconfig sets no line length except the 80 columns of JavaScript" {
  assert_file_contains "${PROJECT_ROOT}/.editorconfig" "[*.{js,mjs}]"
  assert_file_not_contains "${PROJECT_ROOT}/.editorconfig" "max_line_length = 120"
}

@test "package.json declares the tools it configures but does not install as optional peers" {
  for name in vitest @vitest/coverage-v8 typescript markdownlint-cli2; do
    assert_file_contains "${PROJECT_ROOT}/package.json" "\"${name}\""
  done
  assert_file_contains "${PROJECT_ROOT}/package.json" "\"peerDependenciesMeta\""
}

@test "package.json has the scripts of the other repositories, with the same names" {
  for name in eslint eslint-fix prettier prettier-fix markdownlint markdownlint-fix \
    quality quality-fix test bats; do
    assert_file_contains "${PROJECT_ROOT}/package.json" "\"${name}\":"
  done
}

@test ".npmrc keeps the engine and audit settings" {
  assert_file_contains "${PROJECT_ROOT}/.npmrc" "engine-strict=true"
  assert_file_contains "${PROJECT_ROOT}/.npmrc" "audit-level=high"
}

# Writing rules
# ================

# The long dashes are written with their bytes: this file does not hold them.
@test "no long dash (em or en) in the files of the repository" {
  cd "${PROJECT_ROOT}"
  local em en
  em="$(printf '\xe2\x80\x94')"
  en="$(printf '\xe2\x80\x93')"

  # git grep: the tracked files and the new ones, without the binary files; it exits 1 when nothing matches
  run git grep -Il --untracked -e "$em" -e "$en" -- . ':(exclude)package-lock.json'

  [ "$status" -eq 1 ]
  [ -z "$output" ]
}
