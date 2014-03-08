# bower-files

**Work in Progress!** Although tested, this module may not work as expected.
Please feel free to contribute bug reports, ideas and/or code when unexpected
behavior happens.

[![NPM version](http://img.shields.io/npm/v/bower-files.svg)](https://www.npmjs.org/package/bower-files)
[![Dependency Status](http://img.shields.io/gemnasium/ksmithut/bower-files.svg)](https://gemnasium.com/ksmithut/bower-files)
[![Code Climate](http://img.shields.io/codeclimate/github/ksmithut/bower-files.svg)](https://codeclimate.com/github/ksmithut/bower-files)
[![Build Status](http://img.shields.io/travis/ksmithut/bower-files.svg)](https://travis-ci.org/ksmithut/bower-files)
[![Coverage Status](http://img.shields.io/coveralls/ksmithut/bower-files.svg)](https://coveralls.io/r/ksmithut/bower-files)

## Installation

```bash
$ npm install bower-files --save
```

## Usage

This module is meant to help you manage your bower components and use them with task runners such as `grunt` and `gulp`.

**The Problem**

So you use bower to manage your project's front-end dependencies. That's great,
but then when you want to include those packages in your build scripts, what
then? You could have an additional config file that defines which components to
use and the paths to them, but that's just one more thing to manage. You use
bower so you don't have to have that additional step of managing your front-end
libraries.

**The Solution**

`bower-files` is a module that allows you to automatically get the paths to your
components, and automatically split all of the files by extension.

```javascript
var gulp   = require('gulp')
  , gutil  = require('gulp-util')
  , concat = require('gulp-concat')
  , uglify = require('gulp-uglify')
  , files  = require('bower-files')()
  ;

gulp.task('libjs', function () {
  gulp.src(files.js)
    .pipe(concat('lib.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'));
});
```

The other thing that it will do is make sure your components are in the correct
order with the most dependeded upon script being first.

*Other Solutions*

Internally, there are other modules that do this same thing. Perhaps they may
have suggestions for this module and end up using it:

- [`gulp-bower-files`](https://www.npmjs.org/package/gulp-bower-files)

## Options

You can pass options into the function call to customize what you get:

```javascript
var bowerFiles = require('bower-files')
  , jsLib
  ;
jsLib = bowerFiles({
  ext: 'js'
});
```

### `options.json` - The path to your `bower.json` or other such files

#### Default: `bower.json`

If the path given is an absolute path (meaning that it starts with `/`), then it
will read the file given. If it is a relative path, then it will join the
relative path with `process.cwd()`. So the default value ends up being:
`process.cwd() + '/bower.json'`.

### `options.dir` - The path to your `bower_components` or wherever your have
set up your bower components to go.

#### Default: `bower_components`

The same path logic as with the `options.json` path applies here as well.

### `options.ext` - Whether or not to split up the dependencies by extension.

#### Default: `true`

If true, then the resulting object will look something like this:

```javascript
{
  js: [/* array of javascript files*/],
  css: [/* array of css files */]
  /* any other file extensions that may have been included. */
}
```

If false, then the result will be an array of all of the files.

If it's a string, then it will return an array of the files with the given
extension.

```javascript
var bowerFiles = require('bower-files')
  , jsLib
  ;
jsLib = bowerFiles({
  ext: 'js'
});
```

## Troubleshooting

There are a few things that can go wrong.

If it cannot find your `bower.json` or
whatever file you determine, the resulting object will be an error like:
`Error reading project bower.json`.

If it cannot find a dependency defined in your `bower.json` or one of the child
dependencies, it's likely because you need to run `bower install`, but it will
return an Error object like: `Missing dependency "jquery".`;

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
relative paths.

## Development

This project uses [`gulp`](http://gulpjs.com/) for task automation.

```bash
$ npm install -g gulp
```

Here are the three tasks available to use:

* `gulp hint`: runs all pertinent code against jshint. The rules are the ones
defined in [`.jshintrc`](.jshintrc)

* `gulp test`: runs all tests with
[`mocha`](http://visionmedia.github.io/mocha/) for passing and
[`instanbul`](http://gotwarlost.github.io/istanbul/) for code coverage. It
generates html files showing the code coverage.

* `gulp docs`: builds out all of the documentation using
[`docco`](http://jashkenas.github.io/docco/). Note that you need to have docco
installed (`npm install -g docco`). I at one time at docco part of the dev
dependencies, but now I don't. I may be open to putting it back, but I just
wanted to keep the package as small as possible.

You can also run `npm test`, and it does basically does the same thing as
`gulp test`, but an error will be thrown because it does some more istanbul
stuff to send data to the coverage server. When this project runs through
travis, it also sends coverage data to coveralls.io.

When forking and doing pull requests, work off of the `develop` branch. I won't
be super strict on this, but it's what I would prefer. That way we can keep
`master` clean.
