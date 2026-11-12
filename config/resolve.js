import { fileURLToPath } from 'node:url'

/**
 * Resolves a package name to an absolute path, from this package.
 *
 * A tool (Stylelint, Prettier) resolves the names written in a config from the file that holds them. A project spreads
 * our config into its own file, so the names would be looked up from the project, where npm does not always hoist the
 * dependencies of this package (for instance with two versions of the same tool in the tree). Absolute paths do not
 * depend on where the config is read.
 */
export const resolve = (name) => fileURLToPath(import.meta.resolve(name))
