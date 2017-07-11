# del-paths

Create an array of ignore paths suitable for use with the [**del**](https://github.com/sindresorhus/del) module from a file or folder path.

## Installation

```
npm install del-paths
```

## Usage

```javascript
const del = require('del');
const delPaths = require('del-paths')({ debug: true });
const gulp = require('gulp');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

gulp.task('clean', function taskClean() {
  const BOWER_PATH = '.tmp/assets/bower_components';
  const CLEAN_EXCEPTIONS = (argv.cleanTempVendor === true);
  const VENDOR_PATH = '.tmp/assets/vendor';
  var sourceGlobs = ['.tmp/**'];
  if (CLEAN_EXCEPTIONS !== true) {
    sourceGlobs = sourceGlobs.concat(
      delPaths.ignore([BOWER_PATH, VENDOR_PATH]).paths(),
      // delPaths doesn't know if a path is to a file or folder, so it
      // can't automatically ignore all descendants. So, manually add
      // descendant ignoring for folders.
      '!' + BOWER_PATH + '/**',
      '!' + VENDOR_PATH + '/**'
    );
  }
  return del(sourceGlobs);
})

// delPaths.ignore([BOWER_PATH, VENDOR_PATH]).paths() =>
// [
//   '!.tmp',
//   '!.tmp/assets',
//   '!.tmp/assets/bower_components',
//   '!.tmp/assets/vendor'
// ]
```

## API

### delPaths([options])

#### options

Type: `Object`

##### options.debug

Type: `Boolean`

Default: `false`

The initial state for debug mode. Setting this to `true` will log additional messages to the console during execution.

See also [enableDebug](#enabledebug) in delPaths.debug(enableDebug).

### delPaths.debug(enableDebug)

Toggle debug mode on or off.

Returns itself for method chaining.

##### enableDebug

Type: `Boolean`

Default: `false`

Setting this to `true` will log additional messages to the console during execution.

### delPaths.ignore(paths[, options])

Adds the path and its ancestors to an internal list of paths. Each path will only appear once in the list.

Returns itself for method chaining.

##### paths

Type: `String` or `Array` (of Strings)

Paths that you want the del module to ignore.

1.  If a path doesn't already start with `!`, it will be added
2.  Slashes will be normalized. Any backward slashes (`\`) will be replaced with forward slashes (`/`)
3.  Trailing slashes will be removed

This method does not handle glob patterns, so they will be skipped.

#### options

Type: `Object`

##### options.sort

Type: `Boolean`

Default: `false`

A boolean indicationg whether or not the method should sort the internal list of paths if the method modifies the list. By default, this is turned off since `delPaths.paths()` will return a sorted list.

### delPaths.paths()

Returns the internal list of paths as an array of strings, sorted alphabetically.

### delPaths.reset()

Empties the internal list of paths.

Returns itself for method chaining.
