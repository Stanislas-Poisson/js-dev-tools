#!/usr/bin/env bash
#
# BATS test helpers - @stanislas-poisson/js-dev-tools
# The tests run against the source tree of the repository.
#

# The root of the repository (the tests are in tests/bats/unit/)
setup_test_env() {
  export PROJECT_ROOT
  PROJECT_ROOT="$(cd "${BATS_TEST_DIRNAME}/../../.." && pwd)"
}

assert_file_exists() {
  if [[ ! -f "$1" ]]; then
    echo "ASSERTION FAILED: the file does not exist: $1" >&2
    return 1
  fi
}

assert_dir_exists() {
  if [[ ! -d "$1" ]]; then
    echo "ASSERTION FAILED: the folder does not exist: $1" >&2
    return 1
  fi
}

# assert_file_contains FILE TEXT: the text (a fixed string) is in the file
assert_file_contains() {
  if ! grep -qF -- "$2" "$1"; then
    echo "ASSERTION FAILED: ${1} does not contain: ${2}" >&2
    return 1
  fi
}

# assert_file_not_contains FILE TEXT: the text (a fixed string) is not in the file
assert_file_not_contains() {
  if grep -qF -- "$2" "$1"; then
    echo "ASSERTION FAILED: ${1} contains: ${2}" >&2
    return 1
  fi
}

# assert_same_file A B: the two files are identical
assert_same_file() {
  if ! diff -q "$1" "$2" >/dev/null; then
    echo "ASSERTION FAILED: ${1} and ${2} differ" >&2
    return 1
  fi
}
