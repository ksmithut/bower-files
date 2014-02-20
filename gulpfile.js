// Gulp Tasks
// ==========
//
// There are three basic gulp tasks available:
//
// * `gulp hint`
// * `gulp test`
// * `gulp docs`

'use strict';

var gulp     = require('gulp')
  , gutil    = require('gulp-util')
  , mocha    = require('gulp-mocha')
  , jshint   = require('gulp-jshint')
  , exec     = require('gulp-exec')
  , istanbul = require('gulp-istanbul')
  , stylish  = require('jshint-stylish')
  ;

// The default task (`gulp`) runs all except `docs`
gulp.task('default', ['hint', 'test']);

// Hinting
// -------
//
//     gulp hint
//
// This task runs all of the pertinent javascript files through jshint.
gulp.task('hint', function () {
  gulp
    .src([
      '**/*.js',
      '!node_modules/**',
      '!.git/**',
      '!test/**',
      '!coverage/**'
    ])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish));
});

// Testing
// -------
//
//     gulp test
//
// This task runs all of the tests and displays any errors that may have
// happened
gulp.task('test', ['coverage'], function () {
  gulp
    .src([
      'test/*.js'
    ])
    .pipe(mocha({
      reporter: 'spec'
    }))
    .pipe(istanbul.writeReports());
});

// Test Coverage
// -------------
//
//     gulp coverage
//
// This task is to be used in conjuction with gulp test. It shouldn't be used
// by itself as it needs to be run with the tests
gulp.task('coverage', function (cb) {
  gulp
    .src(['lib/**/*.js'])
    .pipe(istanbul())
    .on('end', cb);
});

// Documentation
// -------------
//
//     gulp docs
//
// This task generates the documentation, using docco

gulp.task('docs', function () {
  gulp
    .src([
      '**/*.js',
      '!node_modules/**',
      '!.git/**',
      '!test/**',
      '!docs/**',
      '!coverage/**'
    ])
    .pipe(exec(
      './node_modules/.bin/docco <%= file.path %>'
    ));
});
