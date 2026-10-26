# Contributing

Thank you for helping. js-dev-tools gives the quality tools configuration of the JavaScript and TypeScript projects: ESLint, Prettier, Stylelint, Vitest, TypeScript and markdownlint.

---

## Development workflow

| Step | Command / Action | Description |
| :--- | :--- | :--- |
| **1. Issue** | Open or pick an issue | One branch and one pull request per issue. |
| **2. Install** | `npm ci` | Install the dependencies. |
| **3. Branch** | `git checkout -b feature/#TICKET-name develop` | Create a branch from `develop`. |
| **4. Code** | *(your IDE)* | Keep the change small, and write its test. |
| **5. Check** | `npm run quality` | Run the whole quality gate: ESLint, Prettier, markdownlint and the tests. |
| **6. Commit** | `git commit -m "type(scope): #TICKET subject"` | Use the format of the [zairakai handbook][handbook-git-rules], in English, 72 characters at most. |
| **7. Push** | `git push origin feature/#TICKET-name` | Push and open a pull request to `develop`. |

A pull request needs a review and is merged with a merge commit.

---

## Checks

| Command | Tool | Description |
| :--- | :--- | :--- |
| `npm run eslint` | ESLint | Lint the configurations and the tests with the shipped rules. |
| `npm run prettier` | Prettier | Check the format. `npm run prettier:fix` fixes it. |
| `npm run markdownlint` | markdownlint | Lint the Markdown files. |
| `npm test` | Vitest | Check that every configuration loads and that ESLint applies the rules. |
| `npm run quality` | All | The whole gate. |

A rule must not be disabled to hide an error, and an exclusion is explained where it is written.

The `ci` check runs the same commands and must pass before a change reaches `develop` or `main`.

---

## Releasing

Reserved to the maintainer. Tags are plain `X.Y.Z`, signed, and made on `main` only.

1. Merge `develop` into `main` with a pull request, and wait for the CI of `main`.
2. Tag the merge commit and push the tag:

   ```bash
   git checkout main && git pull
   git tag -s 1.0.0 -m "1.0.0"
   git push origin 1.0.0
   ```

3. The `Release` workflow checks that the tag is on `main` and that the CI passed on that commit, then creates the GitHub release. Its notes list the merged pull requests by label and give the `npm install` line.
4. The workflow then publishes the version on npm, with the provenance of the build.

---

## Dependencies held back

Some dependencies stay on an older version because another package does not accept the new one yet. They are listed in one place, the [dependency policy](https://gitlab.com/zairakai/dependency-policy) (`node.json`), with the reason and the condition that lifts the block. Nothing is written here by hand:

- The workflow `Policy sync` keeps the ignore rules of `.github/dependabot.yml` (between the markers `dependency-policy (npm)`) equal to the policy, with a signed pull request.
- The check `Dependency policy` fails a pull request that updates a package of the policy, in `package.json` or `package-lock.json`.
- When the peers accept the new version, the policy lifts the entry by itself, the next sync removes the rule, and Dependabot proposes the update.

The same holdbacks apply to `@zairakai/js-dev-tools`, which extends this package. A test (`tests/dependencies.test.js`) fails when a dependency has an invalid peer range.

---

## Language

Code, comments, commits, issues and pull requests are in English.

[handbook-git-rules]: https://gitlab.com/zairakai/handbook/-/blob/main/policies/git-rules.md
