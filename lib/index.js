const _ = {
  cloneDeep: require('lodash.clonedeep')
}
const chalk = require('chalk')
const isGlob = require('is-glob')
const isValidGlob = require('is-valid-glob')
const stripTrailingSlashes = require('strip-trailing-slashes')

function DelPaths(options) {
  this._paths = []
  this.debug(options && options.debug)
}

/**
 * Enables / Disables debug mode.
 *
 * @param  {Boolean} enableDebug - If true, enables debug mode, otherwise
 *                                 debugging will be disabled.
 * @return {DelPaths}            - Returns itself for method chaining.
 */
DelPaths.prototype.debug = function delPathsDebug(enableDebug) {
  this._isDebugging = enableDebug === true
  return this
}

/**
 * Creates an array of ignore paths suitable for use with the `del` module from
 * a single file or folder path.
 *
 * Ignores glob patterns, since that would take more complicated code and access
 * to the file system to resolve. Perhaps support for this can be added in the
 * future. The argument name is set with this potential in mind.
 *
 * Since glob patterns are ignored, the leading `!` must not exist on the
 * supplied strings. It will automatically be prepended to all supplied paths.
 *
 * @param  {String|String[]} paths                - Path to the file or folder
 *                                                  that will be ignored.
 * @param  {Object}          [options]            -
 * @param  {Boolean}         [options.sort=false] - Sort list on modify
 * @return {DelPaths}                             - Returns itself for method
 *                                                  chaining.
 *
 * @see {@link https://github.com/sindresorhus/del#beware}
 */
DelPaths.prototype.ignore = function delPathsIgnore(paths, options) {
  var self = this
  const IS_DEBUGGING = this._isDebugging
  const SORT_ON_MODIFY = options && options.sort === true
  var pathsModified = false

  // Checks to make sure that `paths` is either a string or array, and if
  // it's an array it's either empty or consists of only strings.
  if (!isValidGlob(paths)) {
    throw new TypeError(
      'del-paths#ignore: `paths` must be a string or an array of strings.'
    )
  }

  // Arrayify `paths`
  if (!Array.isArray(paths)) {
    paths = [paths]
  }

  paths.forEach(function forEachPath(fspath) {
    var fspathPattern
    var pathFragment
    var pathSegments
    var pathSegmentsLength
    var i
    if (isGlob(fspath)) {
      if (IS_DEBUGGING) {
        console.log(
          chalk.yellow(
            'del-paths#ignore: "' +
              fspath +
              '" is a is a glob pattern, and will be skipped.'
          )
        )
      }
      return
    }
    if (fspath.length === 0) {
      if (IS_DEBUGGING) {
        console.log(
          chalk.yellow(
            'del-paths#ignore: the fspath is an empty string and will be skipped.'
          )
        )
      }
      return
    }

    // 1. Add negation
    // 2. Normalize the path separator
    // 3. Remove trailing slashes
    fspathPattern = stripTrailingSlashes(
      ((fspath.charAt(0) === '!' ? '' : '!') + fspath).replace(/\\/g, '/')
    )

    pathSegments = fspathPattern.split('/')
    pathSegmentsLength = pathSegments.length
    for (i = 0; i < pathSegmentsLength; i++) {
      pathFragment = pathSegments.slice(0, i + 1).join('/')
      // Prevent Duplicates
      if (self._paths.indexOf(pathFragment) === -1) {
        self._paths.push(pathFragment)

        /**
         * delPaths doesn't know if a path is to a file or folder, so it can't
         * automatically ignore all descendants.
         */
        // if(i === pathSegmentsLength-1){
        //   self._paths.push(pathFragment + '/**');
        // }

        pathsModified = true
      }
    }
  })

  if (pathsModified && SORT_ON_MODIFY) {
    this._paths = this._paths.sort()
  }
  return this
}

/**
 * Returns a copy of the array so that mutations to it won't affect this
 * object's internal data.
 *
 * @return {Array}  - Array of Glob strings, or an empty array.
 */
DelPaths.prototype.paths = function delPathsPaths() {
  return _.cloneDeep(this._paths).sort()
}

/**
 * Sets the internal paths collection to an empty array.
 *
 * @return {DelPaths}  - Returns itself for method chaining.
 */
DelPaths.prototype.reset = function delPathsReset() {
  this._paths = []
  return this
}

module.exports = function newDelPaths(options) {
  return new DelPaths(options)
}
