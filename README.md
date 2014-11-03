# bower-files

[![NPM version](http://img.shields.io/npm/v/bower-files.svg?style=flat)](https://www.npmjs.org/package/bower-files)
[![Dependency Status](http://img.shields.io/gemnasium/ksmithut/bower-files.svg?style=flat)](https://gemnasium.com/ksmithut/bower-files)
[![Code Climate](http://img.shields.io/codeclimate/github/ksmithut/bower-files.svg?style=flat)](https://codeclimate.com/github/ksmithut/bower-files)
[![Build Status](http://img.shields.io/travis/ksmithut/bower-files.svg?style=flat)](https://travis-ci.org/ksmithut/bower-files)
[![Coverage Status](http://img.shields.io/codeclimate/coverage/github/ksmithut/bower-files.svg?style=flat)](https://codeclimate.com/github/ksmithut/bower-files)

Helps you dynamically include your bower components into your build process.

**The Problem**

Bower is a great tool to bring in your front-end dependencies (and their
dependencies) to your project. But if you want them to be included in your build
process, you need to manually enter them in to your build process. If you add
or remove dependencies, you need to modify your build process configuration
files.

**The Solution**

`bower-files` aims to simplify your build process setup by dynamically getting
the library files for you to include in whatever build process you use. It
splits up the files by extension, and puts them in the order they need to be in,
in order to work correctly in the browser.

## 2.x (Ch-ch-ch-changes)

There are breaking changes in 2.x. Mostly, it will just throw errors as they
happen. The more I used this, the more I found it was hard to debug because I
didn't check if bower-files failed in my gulpfile and some build process would
fail. Checking for errors also made the module more complex and harder to
manage.

A `join` option is now available! Check in the options below to see how it
works! I put it in there because I was often having to manually group font files
to copy them into my build directory.

The code was refactored a bit and I 'reworded' the tests. Still have 100% test
coverage, but the tests could probably still be fleshed out a bit better. Feel
free to contribute and modify the tests! But I'd still like to maintain 100%
code coverage.

I also removed `lodash` as a dependency. 1MB! Although it was the only
dependency, I figured that I could find some smaller modules (or roll my own)
that did the same things. Although this makes more modules to keep updated, it
reduces total size by a lot (reduced by about 944kb).

## Installation

```bash
npm install bower-files --save-dev
```

## Usage

gulp example...

```javascript
var gulp   = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var lib    = require('bower-files')();

gulp.task('default', function () {
  gulp.src(lib.js)
    .pipe(concat('lib.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'));
});
```

or a grunt example...

```javascript

var lib = require('bower-files')();

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      dist: {
        files: {
          'build/<%= pkg.name %>-lib.<%= pkg.version %>.min.js': lib.js
        }
      }
    },
    cssmin: {
      dist: {
        files: {
          'build/<%= pkg.name %>-lib.<%= pkg.version %>.min.css': lib.css
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', ['uglify', 'cssmin']);

};
```

*Other Solutions*

There are other modules that do this same thing. Perhaps they may have
suggestions for this module and end up using it:

- [`gulp-bower-files`](https://www.npmjs.org/package/gulp-bower-files)

## Options

You can pass options into the function call to customize what you get:

```javascript
var bowerFiles = require('bower-files')
var jsLib      = bowerFiles({ext: 'js'});
```

* `options.cwd` - Your current working directory to look for `bower.json` and
`bower_components`. MUST be an absolute path. Default: `process.cwd()`

* `options.json` - The path to your `bower.json` file. Could be
`components.json` if you wanted! If you use a relative path, it will prepend the
`options.cwd`. If you use an absolute path, it will ignore the `options.cwd`.
Default: `'bower.json'`

* `options.dir` - The path to your `bower_components`. Same as options.json in
relation to your `options.cwd`. Default: `'bower_components'`

* `options.componentJson` - The filename that shows up from `bower` in each
component that contains sub-dependencies and it's 'main' declaration. Default:
`.bower.json`

* `options.symlinkedJson` - The filename that shows up from `bower` for
symlinked components. Default: `bower.json`

* `options.ext` (Boolean/String) - Whether or not to split up the dependencies
by extension. If a String is passed, it will only return the files with the
given extension (don't include the '.'). Default: `true`

* `options.dev` (Boolean) - Whether or not to include devDependencies. Default:
`false`

* `options.self` (Boolean) - Whether or not to include the `main` definition in
the given `bower.json` file.

* `options.join` (Object) - You can specify `join` specifications to join
certain extensions into a single group.

Example:

```javascript
var lib = require('bower-files')({
  join: {fonts: ['eot', 'woff', 'svg', 'ttf']}
});
console.log(lib.fonts);
// now lib.fonts includes all .eot, .woff, .svg, and .ttf files
```

Default: `false`

* `options.overrides` (Object) - An overrides object to override specific
package main files. Occasionally, you'll find a bower component that has no
defined `main` property. So here, you pass in an object that looks like this:

```javascript
var lib = require('bower-files')({
  overrides: {
    jQuery: {
      main: './dist/jquery.min.js',
      dependencies: {}
    }
  }
});
```

Note that you can also add this POJO into `bower.json` in `JSON` form, but if
you specify an overrides directly when calling `bower-files`, it will override
the `bower.json` version.

## Troubleshooting

There are a few things that can go wrong.

Make sure you `bower install`. That will solve a lot of your issues.

Occasionally, you will come across a bower component that doesn't have a `main`
property defined in it's `bower.json` (jQuery didn't used to have it). Because
this is how we determine which files to include, it won't include the component,
but it will return an error. You can, however, provide it with the correct file.

In your own `bower.json`, provide an "overrides" property that looks something
like this:

```javascript
{
  ...
  "overrides": {
    "jquery": {
      "main": "./dist/jquery.js"
    }
  }
}
```

The main property can be a string representing the relative path within the
component directory to the main file to be included, or it can be an array of
relative paths, or even a relative glob.

## Development

You can also run `npm test`, and it does basically does the same thing as
`gulp test`, but an error will be thrown because it does some more istanbul
stuff to send data to the coverage server. When this project runs through
travis, it also sends coverage data to coveralls.io.

When forking and doing pull requests, work off of the `develop` branch. I won't
be super strict on this, but it's what I would prefer. That way we can keep
`master` clean.
